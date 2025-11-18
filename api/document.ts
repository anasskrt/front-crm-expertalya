import api from "@/lib/axiosClient";


export async function getSocieteDocument(id: number) {
    const { data } = await api.get(`/document/${id}`);
    return data;
  }

//   export async function uploadSocieteDocument(societeId: number, file: File) {
//     const fd = new FormData();
//     fd.append("file", file);
//     fd.append("societeId", String(societeId));
//     console.log("Uploading file for societeId:", societeId, file);
//     const { data } = await api.post(`/document/${societeId}/upload`, { fd });

//     return data;
//   }

  export async function uploadSocieteDocument(societeId: number, file: File) {
    const fd = new FormData();
    fd.append("file", file); // le champ doit s'appeler "file" côté Nest (FileInterceptor('file'))
  
    const { data } = await api.post(`/document/${societeId}/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data; // retour de la création BDD (doc créé)
  }

  export async function openDocument(documentId: number) {
    // Ouvre tout de suite l’onglet (évite les bloqueurs de pop-up)
    const w = window.open("", "_blank");
  
    try {
      const res = await api.get(`/document/${documentId}/download`, {
        responseType: "blob",
      });
  
      const type = res.headers["content-type"] || "application/pdf";
      const blob = new Blob([res.data], { type });
      const url = URL.createObjectURL(blob);
  
      if (w) {
        w.location.href = url; // charge le blob dans le nouvel onglet
      } else {
        // fallback si l'onglet a été bloqué
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
  
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      // en cas d'erreur, referme l’onglet ouvert
      if (w) w.close();
      console.error("Erreur d’ouverture du document :", err);
    }
  }
  