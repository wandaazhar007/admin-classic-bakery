import { useEffect, useMemo, useState } from "react";
import styles from "./ProductCreatePage.module.scss";
import api from "../lib/apiClient";
import { uploadProductImages } from "../utils/uploadImages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faImage,
  faXmark,
  faTriangleExclamation,
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
  nextCursor?: string | null;
};

type CreateProductResponse = {
  success: boolean;
  data: { id: string };
};

type ProductCreatePageProps = {
  onNavigate: (to: string) => void;
};

type FormValues = {
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  price: string;
  isActive: boolean;
};

type FormErrors = Partial<Record<keyof FormValues | "images", string>>;

function toNumberSafe(v: string) {
  const n = Number(String(v).replaceAll(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

export default function ProductCreatePage({ onNavigate }: ProductCreatePageProps) {
  const [catsLoading, setCatsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsError, setCatsError] = useState<string>("");

  const [values, setValues] = useState<FormValues>({
    name: "",
    shortDescription: "",
    description: "",
    category: "",
    price: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const categoryOptions = useMemo(() => {
    // Robust mapping: prefer slug, fallback to id, fallback to name
    return categories.map((c) => ({
      label: c.name,
      value: c.slug || c.id || c.name,
    }));
  }, [categories]);

  useEffect(() => {
    const run = async () => {
      setCatsLoading(true);
      setCatsError("");

      try {
        const res = await api.get<CategoriesResponse>("/categories", {
          params: { limit: 100, activeOnly: "true" },
        });

        const list = Array.isArray(res.data.data) ? res.data.data : [];
        setCategories(list);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Gagal memuat kategori.";
        setCatsError(String(msg));
        setCategories([]);
      } finally {
        setCatsLoading(false);
      }
    };

    run();
  }, []);

  useEffect(() => {
    // revoke old previews
    previews.forEach((u) => URL.revokeObjectURL(u));
    const next = files.map((f) => URL.createObjectURL(f));
    setPreviews(next);

    return () => {
      next.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

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

    if (files.length === 0) next.images = "Minimal pilih 1 foto produk.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list);
    setFiles((prev) => [...prev, ...picked]);
    setErrors((p) => ({ ...p, images: undefined }));
  };

  const removeFileAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);

    try {
      const priceNum = toNumberSafe(values.price);

      // 1) create product first (without images)
      const createRes = await api.post<CreateProductResponse>("/products", {
        name: values.name.trim(),
        shortDescription: values.shortDescription.trim(),
        description: values.description.trim() || undefined,
        category: values.category,
        price: priceNum,
        isActive: values.isActive,
      });

      const productId = createRes?.data?.data?.id;
      if (!productId) {
        throw new Error("Product ID tidak ditemukan dari response backend.");
      }

      // 2) upload images to Firebase Storage, then update product with images array
      const uploaded = await uploadProductImages(productId, files);

      await api.put(`/products/${productId}`, {
        images: uploaded,
      });

      onNavigate("/produk");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Gagal membuat produk. Pastikan kamu login sebagai admin.";
      setSubmitError(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className={styles.title}>Tambah Produk</div>
          <div className={styles.subtitle}>Buat produk baru tanpa modal.</div>
        </div>
      </div>

      {submitError ? (
        <div className={styles.alertError} role="alert">
          <span className={styles.alertIcon} aria-hidden="true">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </span>
          <span>{submitError}</span>
        </div>
      ) : null}

      <div className="card">
        <div className="cardHeader">
          <div className={styles.cardTitle}>Form Produk</div>
          <div className={styles.cardHint}>
            Field wajib: nama, deskripsi singkat, kategori, harga, dan foto.
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
                placeholder="Contoh: Bolu Coklat Classic"
              />
              {errors.name ? <div className={styles.errorText}>{errors.name}</div> : null}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Kategori *</label>

              {catsLoading ? (
                <div className={styles.skelSelect} aria-label="Loading categories" />
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
              {errors.category ? (
                <div className={styles.errorText}>{errors.category}</div>
              ) : null}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Harga *</label>
              <input
                value={values.price}
                onChange={(e) => setField("price", e.target.value)}
                className={`${styles.input} ${errors.price ? styles.inputError : ""}`}
                placeholder="Contoh: 25000"
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
                placeholder="Ringkas, cocok untuk list produk"
              />
              {errors.shortDescription ? (
                <div className={styles.errorText}>{errors.shortDescription}</div>
              ) : null}
            </div>

            <div className={styles.fieldFull}>
              <label className={styles.label}>Deskripsi (opsional)</label>
              <textarea
                value={values.description}
                onChange={(e) => setField("description", e.target.value)}
                className={styles.textarea}
                placeholder="Detail produk (optional)"
              />
            </div>

            <div className={styles.fieldFull}>
              <label className={styles.label}>Foto Produk *</label>

              <div className={styles.uploadRow}>
                <label className={styles.uploadBtn}>
                  <span className={styles.uploadIcon} aria-hidden="true">
                    <FontAwesomeIcon icon={faImage} />
                  </span>
                  Pilih Foto (multiple)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className={styles.fileInput}
                    onChange={(e) => onPickFiles(e.target.files)}
                  />
                </label>

                <div className={styles.uploadMeta}>
                  {files.length ? (
                    <span>{files.length} file dipilih</span>
                  ) : (
                    <span className={styles.muted}>Belum ada foto</span>
                  )}
                </div>
              </div>

              {errors.images ? (
                <div className={styles.errorText}>{errors.images}</div>
              ) : null}

              {previews.length ? (
                <div className={styles.previewGrid}>
                  {previews.map((src, idx) => (
                    <div key={`${src}-${idx}`} className={styles.previewCard}>
                      <img
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        className={styles.previewImg}
                      />
                      <button
                        type="button"
                        className={styles.previewRemove}
                        onClick={() => removeFileAt(idx)}
                        aria-label="Remove image"
                        title="Remove"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={submit}
              disabled={submitting}
            >
              <span className={styles.submitIcon} aria-hidden="true">
                <FontAwesomeIcon icon={faPlus} />
              </span>
              {submitting ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}