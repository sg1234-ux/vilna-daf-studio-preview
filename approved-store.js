/* Finished approved pages live separately from the small launcher registry. */
window.ApprovedPageStore = (() => {
  let database;
  function valid(snapshot, ref) {
    return snapshot?.version === 1 && snapshot.ref === ref &&
      snapshot.project?.daf?.ref === ref && typeof snapshot.layout?.body?.html === "string" &&
      typeof snapshot.layout?.right?.html === "string" && typeof snapshot.layout?.left?.html === "string";
  }
  function open() {
    if (!database) database = new Promise((resolve, reject) => {
      const request = indexedDB.open("vilna-daf-approved-pages", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("pages");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Approved-page storage is unavailable."));
    });
    return database;
  }
  async function get(id, ref) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("pages", "readonly");
      const request = transaction.objectStore("pages").get(id);
      request.onsuccess = () => resolve(valid(request.result, ref) ? request.result : null);
      request.onerror = () => reject(request.error);
    });
  }
  async function put(id, snapshot) {
    if (!valid(snapshot, snapshot?.ref)) throw new Error("The approved page is incomplete.");
    const db = await open();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction("pages", "readwrite");
      transaction.objectStore("pages").put(snapshot, id);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("The approved page could not be saved."));
    });
  }
  return { get, put, valid };
})();
