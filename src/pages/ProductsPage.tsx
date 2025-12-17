import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ProductsPage.module.scss";
import api from "../lib/apiClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faTrash,
  faPen,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type ProductImage = { url: string; isPrimary: boolean };

type Product = {
  id: string;
  name: string;
  shortDescription?: string;
  category?: string;
  price: number;
  images?: ProductImage[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ProductsResponse = {
  success: boolean;
  data: Product[];
  nextCursor?: string | null;
};

type ProductsPageProps = {
  onNavigate: (to: string) => void;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatIDRLike(price: number) {
  // Admin panel: keep it simple and consistent
  // (project context doesn’t specify currency formatting rules)
  const safe = Number.isFinite(price) ? price : 0;
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(safe);
}

function getThumbnailUrl(p: Product) {
  const imgs = p.images || [];
  const primary = imgs.find((i) => i.isPrimary)?.url;
  return primary || imgs[0]?.url || "";
}

export default function ProductsPage({ onNavigate }: ProductsPageProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [cursorByPage, setCursorByPage] = useState<Record<number, string | null>>({
    1: null,
  });

  const [items, setItems] = useState<Product[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const pageSize = 5;
  const minSkeletonMs = 900;

  const maxVisiblePage = useMemo(() => {
    // we don’t have total count from backend, so only show pages we can reach
    // show current, and show next page number only if nextCursor exists
    const existingPages = Object.keys(cursorByPage)
      .map((k) => Number(k))
      .filter((n) => Number.isFinite(n));
    const maxLoaded = existingPages.length ? Math.max(...existingPages) : 1;
    return Math.max(maxLoaded, page) + (nextCursor ? 1 : 0);
  }, [cursorByPage, page, nextCursor]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    // reset paging when search changes
    setPage(1);
    setCursorByPage({ 1: null });
  }, [debouncedSearch]);

  useEffect(() => {
    const run = async () => {
      setError("");
      setLoading(true);

      const started = Date.now();

      try {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        const cursor = cursorByPage[page] ?? null;

        const res = await api.get<ProductsResponse>("/products", {
          params: {
            limit: pageSize,
            search: debouncedSearch || undefined,
            startAfterName: cursor || undefined,
          },
          signal: ac.signal,
        });

        const elapsed = Date.now() - started;
        if (elapsed < minSkeletonMs) await sleep(minSkeletonMs - elapsed);

        const payload = res.data;
        const list = Array.isArray(payload.data) ? payload.data : [];

        setItems(list);
        setNextCursor(payload.nextCursor ?? null);

        // store cursor for next page if available (cursor paging)
        if (payload.nextCursor) {
          setCursorByPage((prev) => {
            const nextPage = page + 1;
            if (prev[nextPage] === payload.nextCursor) return prev;
            return { ...prev, [nextPage]: payload.nextCursor ?? null };
          });
        }
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;

        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Gagal memuat produk. Coba lagi.";
        setError(String(msg));
        setItems([]);
        setNextCursor(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [page, cursorByPage, debouncedSearch]);

  const openDeleteConfirm = (p: Product) => {
    setDeleteTarget(p);
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
    setError("");

    try {
      await api.delete(`/products/${deleteTarget.id}`);

      // refresh current page
      // if the page becomes empty after delete and page > 1, go back one page
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        // re-fetch by triggering a cursorByPage state change is messy; just call effect by toggling page
        setPage((p) => p);
      }

      closeDeleteConfirm();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Gagal menghapus produk. Pastikan kamu login sebagai admin.";
      setError(String(msg));
    } finally {
      setDeleting(false);
    }
  };

  const canGoPrev = page > 1;
  const canGoNext = Boolean(nextCursor);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <div className={styles.title}>Produk</div>
          <div className={styles.subtitle}>
            Kelola daftar produk Classic Bakery (5 item per halaman).
          </div>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => onNavigate("/produk/tambah")}
        >
          <span className={styles.btnIcon} aria-hidden="true">
            <FontAwesomeIcon icon={faPlus} />
          </span>
          Tambah Produk
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            placeholder="Cari produk..."
            aria-label="Cari produk"
          />
        </div>

        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canGoPrev || loading}
          >
            Prev
          </button>

          <div className={styles.pageNumbers} aria-label="Pagination">
            {Array.from({ length: maxVisiblePage }, (_, i) => i + 1)
              .slice(0, 7) // keep it compact
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.pageNumber} ${n === page ? styles.pageNumberActive : ""
                    }`}
                  onClick={() => setPage(n)}
                  disabled={loading || (n > page && n > maxVisiblePage)}
                >
                  {n}
                </button>
              ))}
            {maxVisiblePage > 7 ? <span className={styles.ellipsis}>…</span> : null}
          </div>

          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => p + 1)}
            disabled={!canGoNext || loading}
          >
            Next
          </button>
        </div>
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
          <div className={styles.tableTitle}>Daftar Produk</div>
          <div className={styles.tableHint}>
            Tips: pencarian berjalan otomatis (live search) tanpa tombol.
          </div>
        </div>

        <div className="cardBody">
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thPhoto}>Foto</th>
                  <th>Nama</th>
                  <th>Kategori</th>
                  <th className={styles.thPrice}>Harga</th>
                  <th className={styles.thAction}>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: pageSize }).map((_, idx) => (
                    <tr key={`sk-${idx}`}>
                      <td>
                        <div className={`${styles.skel} ${styles.skelThumb}`} />
                      </td>
                      <td>
                        <div className={`${styles.skel} ${styles.skelLine}`} />
                        <div className={`${styles.skel} ${styles.skelLineSm}`} />
                      </td>
                      <td>
                        <div className={`${styles.skel} ${styles.skelPill}`} />
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
                ) : items.length ? (
                  items.map((p) => {
                    const thumb = getThumbnailUrl(p);
                    return (
                      <tr key={p.id}>
                        <td>
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={p.name}
                              className={styles.thumb}
                              loading="lazy"
                            />
                          ) : (
                            <div className={styles.thumbPlaceholder} aria-label="No image" />
                          )}
                        </td>
                        <td>
                          <div className={styles.name}>{p.name}</div>
                          {p.shortDescription ? (
                            <div className={styles.sub}>{p.shortDescription}</div>
                          ) : null}
                        </td>
                        <td>
                          <span className={styles.categoryPill}>
                            {p.category || "-"}
                          </span>
                        </td>
                        <td className={styles.price}>Rp {formatIDRLike(p.price)}</td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              aria-label="Edit product"
                              title="Edit"
                              onClick={() => onNavigate(`/produk/${p.id}/edit`)}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>

                            <button
                              type="button"
                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              aria-label="Delete product"
                              title="Delete"
                              onClick={() => openDeleteConfirm(p)}
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
                    <td colSpan={5}>
                      <div className={styles.empty}>
                        Tidak ada produk ditemukan.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileHint}>
            Jika tabel kepotong di layar kecil, geser ke samping.
          </div>
        </div>
      </div>

      {confirmOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Hapus produk?</div>
            <div className={styles.modalText}>
              Kamu yakin ingin menghapus{" "}
              <span className={styles.modalStrong}>
                {deleteTarget?.name || "produk ini"}
              </span>
              ? Tindakan ini akan menonaktifkan produk (soft delete).
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