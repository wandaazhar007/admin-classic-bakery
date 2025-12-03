// // src/pages/ProductsPage.tsx
// import { useEffect, useState, type FormEvent } from "react";
// import api from "../lib/apiClient";
// import { uploadProductImages } from "../utils/uploadImages";
// import { useAuth } from "../context/AuthContext";

// type ProductImage = {
//   url: string;
//   isPrimary: boolean;
// };

// type Product = {
//   id: string;
//   name: string;
//   slug: string;
//   shortDescription: string;
//   description: string;
//   priceMin: number;
//   priceMax: number;
//   category: string;
//   images: ProductImage[];
//   isActive: boolean;
// };

// type CreateProductBody = Omit<Product, "id" | "images"> & {
//   images?: ProductImage[];
// };

// export default function ProductsPage() {
//   const { logout } = useAuth();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // form state
//   const [name, setName] = useState("");
//   const [shortDescription, setShortDescription] = useState("");
//   const [description, setDescription] = useState("");
//   const [priceMin, setPriceMin] = useState(45000);
//   const [priceMax, setPriceMax] = useState(50000);
//   const [category, setCategory] = useState("bolu-jadul");
//   const [files, setFiles] = useState<FileList | null>(null);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         const res = await api.get("/api/products", {
//           params: { limit: 200, activeOnly: true },
//         });
//         setProducts(res.data.data || []);
//       } catch (err: any) {
//         console.error(err);
//         setError("Gagal memuat produk");
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, []);

//   const handleCreate = async (e: FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSaving(true);

//     try {
//       // 1) create a product shell to get an ID from backend (or use slug as temp id)
//       const body: CreateProductBody = {
//         name,
//         slug: name
//           .toLowerCase()
//           .trim()
//           .replace(/[^a-z0-9]+/g, "-")
//           .replace(/^-+|-+$/g, ""),
//         shortDescription,
//         description,
//         priceMin,
//         priceMax,
//         category,
//         isActive: true,
//       };

//       // backend create (without images first)
//       const createRes = await api.post("/api/products", body);
//       const created: Product = createRes.data.data;

//       let images: ProductImage[] = [];

//       if (files && files.length > 0) {
//         // 2) upload images to Firebase Storage
//         images = await uploadProductImages(created.id, Array.from(files));

//         // 3) update product with image URLs
//         const updateRes = await api.put(`/api/products/${created.id}`, {
//           images,
//         });
//         const updated: Product = updateRes.data.data;
//         setProducts((prev) => [updated, ...prev]);
//       } else {
//         setProducts((prev) => [created, ...prev]);
//       }

//       // reset form
//       setName("");
//       setShortDescription("");
//       setDescription("");
//       setPriceMin(45000);
//       setPriceMax(50000);
//       setCategory("bolu-jadul");
//       setFiles(null);
//       (document.getElementById("product-images") as HTMLInputElement).value =
//         "";
//     } catch (err: any) {
//       console.error(err);
//       setError("Gagal membuat produk");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="page">
//       <header className="topbar">
//         <h1>Classic Bakery – Admin Produk</h1>
//         <button onClick={logout}>Logout</button>
//       </header>

//       <section className="card">
//         <h2>Tambah Produk Baru</h2>
//         <form className="form-grid" onSubmit={handleCreate}>
//           <label>
//             Nama Produk
//             <input
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//           </label>

//           <label>
//             Kategori
//             <select
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//             >
//               <option value="bolu-jadul">Bolu Jadul</option>
//               <option value="bolu-premium">Bolu Premium</option>
//               <option value="bolu-modern">Bolu Modern</option>
//               <option value="bolu-buah">Bolu Buah</option>
//               <option value="bolu-coklat">Bolu Coklat</option>
//             </select>
//           </label>

//           <label className="full">
//             Short Description
//             <input
//               value={shortDescription}
//               onChange={(e) => setShortDescription(e.target.value)}
//               required
//             />
//           </label>

//           <label className="full">
//             Description
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               rows={3}
//             />
//           </label>

//           <label>
//             Harga minimum
//             <input
//               type="number"
//               value={priceMin}
//               onChange={(e) => setPriceMin(Number(e.target.value))}
//               required
//             />
//           </label>

//           <label>
//             Harga maksimum
//             <input
//               type="number"
//               value={priceMax}
//               onChange={(e) => setPriceMax(Number(e.target.value))}
//               required
//             />
//           </label>

//           <label className="full">
//             Foto Produk (bisa lebih dari 1)
//             <input
//               id="product-images"
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={(e) => setFiles(e.target.files)}
//             />
//           </label>

//           {error && (
//             <p className="error-text full" style={{ marginTop: "0.5rem" }}>
//               {error}
//             </p>
//           )}

//           <div className="full" style={{ marginTop: "0.5rem" }}>
//             <button type="submit" disabled={saving}>
//               {saving ? "Menyimpan..." : "Simpan Produk"}
//             </button>
//           </div>
//         </form>
//       </section>

//       <section className="card">
//         <h2>Daftar Produk</h2>
//         {loading ? (
//           <p>Memuat...</p>
//         ) : (
//           <table className="table">
//             <thead>
//               <tr>
//                 <th>Foto</th>
//                 <th>Nama</th>
//                 <th>Kategori</th>
//                 <th>Harga</th>
//               </tr>
//             </thead>
//             <tbody>
//               {products.map((p) => {
//                 const primary =
//                   p.images.find((img) => img.isPrimary) || p.images[0];

//                 return (
//                   <tr key={p.id}>
//                     <td>
//                       {primary && (
//                         <img
//                           src={primary.url}
//                           alt={p.name}
//                           style={{ width: 60, borderRadius: 8 }}
//                         />
//                       )}
//                     </td>
//                     <td>{p.name}</td>
//                     <td>{p.category}</td>
//                     <td>
//                       Rp {p.priceMin.toLocaleString("id-ID")} –{" "}
//                       {p.priceMax.toLocaleString("id-ID")}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         )}
//       </section>
//     </div>
//   );
// }


// src/pages/ProductsPage.tsx
import { useEffect, useState, type FormEvent } from "react";
import api from "../lib/apiClient";
import { uploadProductImages } from "../utils/uploadImages";
import { useAuth } from "../context/AuthContext";

type ProductImage = {
  url: string;
  isPrimary: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  category: string;
  images: ProductImage[];
  isActive: boolean;
};

type CreateProductBody = Omit<Product, "id" | "images"> & {
  images?: ProductImage[];
};

export default function ProductsPage() {
  const { logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(45000);
  const [category, setCategory] = useState("bolu-jadul");
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // const res = await api.get("/api/products", {
        //   params: { limit: 200, activeOnly: true },
        // });
        // setProducts(res.data.data || []);

        const res = await api.get("/api/products", {
          params: { limit: 200, activeOnly: true },
        });

        // Normalize price & images so UI is safe
        const normalized: Product[] = (res.data.data || []).map((p: any) => ({
          ...p,
          price: Number(p.price ?? 0),
          images: Array.isArray(p.images) ? p.images : [],
        }));

        setProducts(normalized);
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const body: CreateProductBody = {
        name,
        slug: name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        shortDescription,
        description,
        price,
        category,
        isActive: true,
      };

      // 1) Create product without images first (backend will generate ID)
      const createRes = await api.post("/api/products", body);
      const created: Product = createRes.data.data;

      let images: ProductImage[] = [];

      if (files && files.length > 0) {
        // 2) Upload images to Firebase Storage
        images = await uploadProductImages(created.id, Array.from(files));

        // 3) Update product with image URLs
        const updateRes = await api.put(`/api/products/${created.id}`, {
          images,
        });
        const updated: Product = updateRes.data.data;
        setProducts((prev) => [updated, ...prev]);
      } else {
        setProducts((prev) => [created, ...prev]);
      }

      // reset form
      setName("");
      setShortDescription("");
      setDescription("");
      setPrice(45000);
      setCategory("bolu-jadul");
      setFiles(null);
      (document.getElementById("product-images") as HTMLInputElement).value =
        "";
    } catch (err: any) {
      console.error(err);
      setError("Gagal membuat produk");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <h1>Classic Bakery – Admin Produk</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <section className="card">
        <h2>Tambah Produk Baru</h2>
        <form className="form-grid" onSubmit={handleCreate}>
          <label>
            Nama Produk
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Kategori
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="bolu-jadul">Bolu Jadul</option>
              <option value="bolu-premium">Bolu Premium</option>
              <option value="bolu-modern">Bolu Modern</option>
              <option value="bolu-buah">Bolu Buah</option>
              <option value="bolu-coklat">Bolu Coklat</option>
            </select>
          </label>

          <label className="full">
            Short Description
            <input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />
          </label>

          <label className="full">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>

          <label>
            Harga (Rp)
            <input
              type="number"
              value={price}
              min={0}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </label>

          <div /> {/* spacer to keep grid even */}

          <label className="full">
            Foto Produk (bisa lebih dari 1)
            <input
              id="product-images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
          </label>

          {error && (
            <p className="error-text full" style={{ marginTop: "0.5rem" }}>
              {error}
            </p>
          )}

          <div className="full" style={{ marginTop: "0.5rem" }}>
            <button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Daftar Produk</h2>
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Harga</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const primary =
                  p.images.find((img) => img.isPrimary) || p.images[0];

                return (
                  <tr key={p.id}>
                    <td>
                      {primary && (
                        <img
                          src={primary.url}
                          alt={p.name}
                          style={{ width: 60, borderRadius: 8 }}
                        />
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>Rp {p.price.toLocaleString("id-ID")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}