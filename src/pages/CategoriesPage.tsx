import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CategoriesPage.module.scss";
import api from "../lib/apiClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faTrash,
  faPen,
  faTriangleExclamation,
  faXmark,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";

type Category = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: number; // epoch ms
  updatedAt?: number; // epoch ms
  deletedAt?: number;
};

type CategoriesResponse = {
  success: boolean;
  data: Category[];
  nextCursor?: null;
};

type CategoriesPageProps = {
  notify: (message: string, type?: "success" | "error") => void;
};

type ModalMode = "create" | "edit";

type FormValues = {
  name: string;
  description: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatDateEpoch(epoch?: number) {
  if (!epoch || !Number.isFinite(epoch)) return "-";
  const d = new Date(epoch);
  // tampilkan format yang enak dibaca (ID)
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function CategoriesPage({ notify }: CategoriesPageProps) {
  const pageSize = 5;
  const minSkeletonMs = 900;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);

  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  // modal add/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editing, setEditing] = useState<Category | null>(null);

  const [values, setValues] = useState<FormValues>({ name: "", description: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchCategories = async () => {
    setError("");
    setLoading(true);

    const started = Date.now();

    try {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const res = await api.get<CategoriesResponse>("/categories", {
        params: {
          limit: 100,
          search: debouncedSearch || undefined,
          activeOnly: "true",
        },
        signal: ac.signal,
      });

      const elapsed = Date.now() - started;
      if (elapsed < minSkeletonMs) await sleep(minSkeletonMs - elapsed);

      const list = Array.isArray(res.data.data) ? res.data.data : [];
      setItems(list);
    } catch (e: any) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;

      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Gagal memuat kategori. Coba lagi.";
      setError(String(msg));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const pageCount = useMemo(() => {
    const total = items.length;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [items.length]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const openCreate = () => {
    setModalMode("create");
    setEditing(null);
    setValues({ name: "", description: "" });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setModalMode("edit");
    setEditing(cat);
    setValues({
      name: cat.name || "",
      description: cat.description || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  const setField = <K extends keyof FormValues>(key: K, val: FormValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const next: FormErrors = {};
    if (!values.name.trim()) next.name = "Nama kategori wajib diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      if (modalMode === "create") {
        await api.post("/categories", {
          name: values.name.trim(),
          description: values.description.trim() || undefined,
        });
        notify("kategori berhasil disimpan", "success");
      } else {
        if (!editing?.id) {
          notify("kategori gagal disimpan", "error");
          setSaving(false);
          return;
        }
        await api.put(`/categories/${editing.id}`, {
          name: values.name.trim(),
          description: values.description.trim() || undefined,
        });
        notify("kategori berhasil disimpan", "success");
      }

      closeModal();
      await fetchCategories();
    } catch {
      notify("kategori gagal disimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirm = (cat: Category) => {
    setDeleteTarget(cat);
    setConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  const doDelete = async () => {
    if (!deleteTarget?.id) return;

    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteTarget.id}`);
      notify("kategori berhasil dihapus", "success");
      closeDeleteConfirm();

      // reload list + adjust page if needed
      const isLastRowOnPage = pagedItems.length === 1 && page > 1;
      await fetchCategories();
      if (isLastRowOnPage) setPage((p) => Math.max(1, p - 1));
    } catch {
      notify("kategori gagal dihapus", "error");
    } finally {
      setDeleting(false);
    }
  };

  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <div className={styles.title}>Kategori</div>
          <div className={styles.subtitle}>
            Live search + pagination 5 item per halaman.
          </div>
        </div>
      </div>

      {/* search kiri + tambah kanan sejajar */}
      <div className={styles.topBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            placeholder="Cari kategori..."
            aria-label="Cari kategori"
          />
        </div>

        <button type="button" className={styles.primaryButton} onClick={openCreate}>
          <span className={styles.btnIcon} aria-hidden="true">
            <FontAwesomeIcon icon={faPlus} />
          </span>
          Tambah Kategori
        </button>
      </div>

      {error ? (
        <div className={styles.alertError} role="alert">
          <span className={styles.alertIcon} aria-hidden="true">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </span>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="card">
        <div className="cardHeader">
          <div className={styles.tableTitle}>Daftar Kategori</div>
          <div className={styles.tableHint}>Geser tabel ke samping di layar kecil.</div>
        </div>

        <div className="cardBody">
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama Kategori</th>
                  <th className={styles.thDate}>Tanggal</th>
                  <th className={styles.thAction}>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: pageSize }).map((_, idx) => (
                    <tr key={`sk-${idx}`}>
                      <td>
                        <div className={`${styles.skel} ${styles.skelLine}`} />
                        <div className={`${styles.skel} ${styles.skelLineSm}`} />
                      </td>
                      <td>
                        <div className={`${styles.skel} ${styles.skelLine}`} />
                      </td>
                      <td>
                        <div className={styles.skelActions}>
                          <div className={`${styles.skel} ${styles.skelIcon}`} />
                          <div className={`${styles.skel} ${styles.skelIcon}`} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : pagedItems.length ? (
                  pagedItems.map((c) => {
                    const dateEpoch = c.updatedAt ?? c.createdAt;
                    return (
                      <tr key={c.id}>
                        <td>
                          <div className={styles.name}>{c.name}</div>
                          {c.description ? (
                            <div className={styles.sub}>{c.description}</div>
                          ) : (
                            <div className={styles.subMuted}>—</div>
                          )}
                        </td>

                        <td className={styles.dateCell}>
                          {formatDateEpoch(dateEpoch)}
                        </td>

                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              aria-label="Edit category"
                              title="Edit"
                              onClick={() => openEdit(c)}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>

                            <button
                              type="button"
                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              aria-label="Delete category"
                              title="Delete"
                              onClick={() => openDeleteConfirm(c)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className={styles.empty}>Tidak ada kategori ditemukan.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* pagination di bawah table */}
          <div className={styles.paginationBottom}>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev || loading}
            >
              Prev
            </button>

            <div className={styles.pageInfo}>
              Halaman <span className={styles.pageStrong}>{page}</span> / {pageCount}
            </div>

            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={!canNext || loading}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal tambah/edit */}
      {modalOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                {modalMode === "create" ? "Tambah Kategori" : "Edit Kategori"}
              </div>

              <button
                type="button"
                className={styles.modalClose}
                aria-label="Close"
                onClick={closeModal}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label}>Nama Kategori *</label>
                <input
                  value={values.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                />
                {errors.name ? (
                  <div className={styles.errorText}>{errors.name}</div>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Deskripsi</label>
                <textarea
                  value={values.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className={styles.textarea}
                  rows={4}
                  placeholder="(opsional)"
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalBtn}
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="button"
                  className={styles.modalBtnPrimary}
                  onClick={submit}
                  disabled={saving}
                >
                  <span className={styles.btnIcon} aria-hidden="true">
                    <FontAwesomeIcon icon={faFloppyDisk} />
                  </span>
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.modalBackdropBtn}
            aria-label="Close"
            onClick={closeModal}
            disabled={saving}
          />
        </div>
      ) : null}

      {/* Modal konfirmasi delete */}
      {confirmOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Hapus kategori?</div>
            <div className={styles.modalText}>
              Kamu yakin ingin menghapus{" "}
              <span className={styles.modalStrong}>
                {deleteTarget?.name || "kategori ini"}
              </span>
              ?
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalBtn}
                onClick={closeDeleteConfirm}
                disabled={deleting}
              >
                Batal
              </button>

              <button
                type="button"
                className={`${styles.modalBtn} ${styles.modalBtnDanger}`}
                onClick={doDelete}
                disabled={deleting}
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>

          <button
            type="button"
            className={styles.modalBackdropBtn}
            aria-label="Close"
            onClick={closeDeleteConfirm}
            disabled={deleting}
          />
        </div>
      ) : null}
    </div>
  );
}