import { useEffect, useMemo, useState } from "react";
import styles from "./ProductEditPage.module.scss";
import api from "../lib/apiClient";
import { uploadProductImages, type UploadedImage } from "../utils/uploadImages";
import { Editor } from "@tinymce/tinymce-react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFloppyDisk,
  faImage,
  faTrash,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

type Category = {
  id: string;
  name: string;
  slug?: string;
  isActive?: boolean;
};

type CategoriesResponse = {
  success: boolean;
  data: Category[];
};

type ProductImage = { url: string; isPrimary: boolean };

type Product = {
  id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  price: number;
  images?: ProductImage[];
  isActive?: boolean;
};

type ProductResponse = {
  success: boolean;
  data: Product;
};

type ProductEditPageProps = {
  productId: string;
  onNavigate: (to: string) => void;
  notify: (message: string, type?: "success" | "error") => void;
};

type FormValues = {
  name: string;
  shortDescription: string;
  description: string; // HTML
  category: string;
  price: string;
  isActive: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const tinymceApiKey = import.meta.env.VITE_TINYMCE_API_KEY;

function toNumberSafe(v: string) {
  const n = Number(String(v).replaceAll(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function normalizeImages(imgs: ProductImage[]) {
  if (imgs.length === 0) return imgs;
  const hasPrimary = imgs.some((i) => i.isPrimary);
  if (!hasPrimary) return imgs.map((i, idx) => ({ ...i, isPrimary: idx === 0 }));

  // kalau ada beberapa primary, biarkan pertama tetap primary
  let firstPrimaryFound = false;
  return imgs.map((i) => {
    if (!i.isPrimary) return i;
    if (!firstPrimaryFound) {
      firstPrimaryFound = true;
      return i;
    }
    return { ...i, isPrimary: false };
  });
}

export default function ProductEditPage({
  productId,
  onNavigate,
  notify,
}: ProductEditPageProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [values, setValues] = useState<FormValues>({
    name: "",
    shortDescription: "",
    description: "",
    category: "",
    price: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      label: c.name,
      value: c.slug || c.id || c.name,
    }));
  }, [categories]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const prodRes = await api.get<ProductResponse>(`/products/${productId}`);
        const p = prodRes.data.data;

        setValues({
          name: p.name || "",
          shortDescription: p.shortDescription || "",
          description: p.description || "",
          category: p.category || "",
          price: String(p.price ?? ""),
          isActive: p.isActive !== false,
        });

        setExistingImages(Array.isArray(p.images) ? p.images : []);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || e?.message || "Gagal memuat data produk.";
        setLoadError(String(msg));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [productId]);

  useEffect(() => {
    const run = async () => {
      setCatsLoading(true);
      setCatsError("");
      try {
        const res = await api.get<CategoriesResponse>("/categories", {
          params: { limit: 100, activeOnly: "true" },
        });
        setCategories(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || e?.message || "Gagal memuat kategori.";
        setCatsError(String(msg));
        setCategories([]);
      } finally {
        setCatsLoading(false);
      }
    };

    run();
  }, []);

  useEffect(() => {
    newPreviews.forEach((u) => URL.revokeObjectURL(u));
    const next = newFiles.map((f) => URL.createObjectURL(f));
    setNewPreviews(next);

    return () => {
      next.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newFiles]);

  const setField = <K extends keyof FormValues>(key: K, val: FormValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const next: FormErrors = {};

    if (!values.name.trim()) next.name = "Nama produk wajib diisi.";
    if (!values.shortDescription.trim())
      next.shortDescription = "Deskripsi singkat wajib diisi.";
    if (!values.category) next.category = "Kategori wajib dipilih.";

    const priceNum = toNumberSafe(values.price);
    if (!values.price.trim()) next.price = "Harga wajib diisi.";
    else if (!Number.isFinite(priceNum) || priceNum <= 0)
      next.price = "Harga harus angka dan > 0.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list);
    setNewFiles((prev) => [...prev, ...picked]);
  };

  const removeNewFileAt = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const openRemoveExisting = (idx: number) => {
    setRemoveIndex(idx);
    setConfirmRemoveOpen(true);
  };

  const closeRemoveExisting = () => {
    if (saving) return;
    setConfirmRemoveOpen(false);
    setRemoveIndex(null);
  };

  const confirmRemoveExisting = () => {
    if (removeIndex === null) return;
    setExistingImages((prev) => prev.filter((_, i) => i !== removeIndex));
    closeRemoveExisting();
  };

  const save = async () => {
    if (!validate()) {
      notify("produk gagal disimpan", "error");
      return;
    }

    setSaving(true);

    try {
      const priceNum = toNumberSafe(values.price);

      let uploaded: UploadedImage[] = [];
      if (newFiles.length) {
        uploaded = await uploadProductImages(productId, newFiles);
      }

      const merged = normalizeImages([
        ...(existingImages || []),
        ...(uploaded || []),
      ]);

      await api.put(`/products/${productId}`, {
        name: values.name.trim(),
        shortDescription: values.shortDescription.trim(),
        description: values.description || "",
        category: values.category,
        price: priceNum,
        isActive: values.isActive,
        images: merged,
      });

      notify("produk berhasil disimpan", "success");
      onNavigate("/produk");
    } catch {
      notify("produk gagal disimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingCard}>Loading produk...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div className={styles.alertError} role="alert">
          <span className={styles.alertIcon} aria-hidden="true">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </span>
          <span>{loadError}</span>
        </div>

        <button
          type="button"
          className={styles.backBtn}
          onClick={() => onNavigate("/produk")}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Kembali
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => onNavigate("/produk")}
        >
          <span className={styles.backIcon} aria-hidden="true">
            <FontAwesomeIcon icon={faArrowLeft} />
          </span>
          Kembali
        </button>

        <div className={styles.titleWrap}>
          <div className={styles.title}>Edit Produk</div>
          <div className={styles.subtitle}>Update data produk dan gambar.</div>
        </div>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div className={styles.cardTitle}>Form Edit</div>
          <div className={styles.cardHint}>
            Foto existing bisa dihapus dan kamu bisa tambah foto baru.
          </div>
        </div>

        <div className="cardBody">
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Nama Produk *</label>
              <input
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              />
              {errors.name ? <div className={styles.errorText}>{errors.name}</div> : null}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Kategori *</label>

              {catsLoading ? (
                <div className={styles.skelSelect} />
              ) : (
                <select
                  value={values.category}
                  onChange={(e) => setField("category", e.target.value)}
                  className={`${styles.input} ${errors.category ? styles.inputError : ""}`}
                >
                  <option value="">Pilih kategori...</option>
                  {categoryOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              )}

              {catsError ? <div className={styles.errorText}>{catsError}</div> : null}
              {errors.category ? <div className={styles.errorText}>{errors.category}</div> : null}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Harga *</label>
              <input
                value={values.price}
                onChange={(e) => setField("price", e.target.value)}
                className={`${styles.input} ${errors.price ? styles.inputError : ""}`}
                inputMode="numeric"
              />
              {errors.price ? <div className={styles.errorText}>{errors.price}</div> : null}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Aktif</label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={values.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                />
                <span className={styles.switchUi} />
                <span className={styles.switchText}>
                  {values.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </label>
            </div>

            <div className={styles.fieldFull}>
              <label className={styles.label}>Deskripsi Singkat *</label>
              <input
                value={values.shortDescription}
                onChange={(e) => setField("shortDescription", e.target.value)}
                className={`${styles.input} ${errors.shortDescription ? styles.inputError : ""
                  }`}
              />
              {errors.shortDescription ? (
                <div className={styles.errorText}>{errors.shortDescription}</div>
              ) : null}
            </div>

            <div className={styles.fieldFull}>
              <label className={styles.label}>Deskripsi (WYSIWYG)</label>
              <div className={styles.editorWrap}>
                <Editor
                  apiKey={tinymceApiKey}
                  value={values.description}
                  onEditorChange={(content) => setField("description", content)}
                  init={{
                    height: 220,
                    menubar: false,
                    statusbar: false,
                    branding: false,
                    plugins: ["link", "lists"],
                    toolbar: "bold italic | bullist numlist | link",
                  }}
                />
              </div>
              <div className={styles.helper}>Fitur: bold/italic, list, link.</div>
            </div>

            <div className={styles.fieldFull}>
              <label className={styles.label}>Foto Existing</label>

              {existingImages.length ? (
                <div className={styles.previewGrid}>
                  {existingImages.map((img, idx) => (
                    <div key={`${img.url}-${idx}`} className={styles.previewCard}>
                      <img src={img.url} alt={`Existing ${idx + 1}`} className={styles.previewImg} />
                      <button
                        type="button"
                        className={styles.previewRemove}
                        onClick={() => openRemoveExisting(idx)}
                        aria-label="Remove existing image"
                        title="Remove"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      {img.isPrimary ? <div className={styles.primaryBadge}>Primary</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.muted}>Tidak ada foto existing.</div>
              )}
            </div>

            <div className={styles.fieldFull}>
              <label className={styles.label}>Tambah Foto Baru (multiple)</label>

              <div className={styles.uploadRow}>
                <label className={styles.uploadBtn}>
                  <span className={styles.uploadIcon} aria-hidden="true">
                    <FontAwesomeIcon icon={faImage} />
                  </span>
                  Pilih Foto
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className={styles.fileInput}
                    onChange={(e) => onPickFiles(e.target.files)}
                  />
                </label>

                <div className={styles.uploadMeta}>
                  {newFiles.length ? (
                    <span>{newFiles.length} file baru dipilih</span>
                  ) : (
                    <span className={styles.muted}>Belum ada foto baru</span>
                  )}
                </div>
              </div>

              {newPreviews.length ? (
                <div className={styles.previewGrid}>
                  {newPreviews.map((src, idx) => (
                    <div key={`${src}-${idx}`} className={styles.previewCard}>
                      <img src={src} alt={`New ${idx + 1}`} className={styles.previewImg} />
                      <button
                        type="button"
                        className={styles.previewRemove}
                        onClick={() => removeNewFileAt(idx)}
                        aria-label="Remove new image"
                        title="Remove"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                      <div className={styles.newBadge}>New</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={save}
              disabled={saving}
            >
              <span className={styles.saveIcon} aria-hidden="true">
                <FontAwesomeIcon icon={faFloppyDisk} />
              </span>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>

      {confirmRemoveOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Hapus foto?</div>
            <div className={styles.modalText}>
              Foto akan dihapus dari produk saat kamu menekan tombol Simpan.
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.modalBtn} onClick={closeRemoveExisting}>
                Batal
              </button>
              <button
                type="button"
                className={`${styles.modalBtn} ${styles.modalBtnDanger}`}
                onClick={confirmRemoveExisting}
              >
                Hapus
              </button>
            </div>
          </div>

          <button
            type="button"
            className={styles.modalBackdropBtn}
            aria-label="Close"
            onClick={closeRemoveExisting}
          />
        </div>
      ) : null}
    </div>
  );
}