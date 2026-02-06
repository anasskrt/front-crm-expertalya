import api from "@/lib/axiosClient";

export async function getSocieteDocument(id: number) {
  const { data } = await api.get(`/document/${id}`);
  return data;
}

export async function uploadSocieteDocument(societeId: number, file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const { data } = await api.post(`/document/${societeId}/upload`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function openDocument(documentId: number) {
  const w = window.open("", "_blank");

  try {
    const res = await api.get(`/document/${documentId}/download`, {
      responseType: "blob",
    });

    const type = res.headers["content-type"] || "application/pdf";
    const blob = new Blob([res.data], { type });
    const url = URL.createObjectURL(blob);

    if (w) {
      w.location.href = url;
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    if (w) w.close();
    console.error("Erreur d'ouverture du document :", err);
  }
}
