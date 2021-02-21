export const modifyKeysRecursive = (v, fn) => {
  if (typeof v === 'object' && v !== null && v.constructor === Object) {
    let entries = Object.entries(v)
    // call fn on [k,v] pair, should return a new [k,v] pair
    // also pass in parent object, so there is a reference to other fields if needed
    entries = entries.map(e => fn(e, v))
    // if it returned a null entry, remove it
    entries = entries.filter(x => x != null)
    entries = entries.flat()

    // recursively apply to nested objects/lists
    entries = entries.map(([sk, sv]) => [sk, modifyKeysRecursive(sv, fn)])

    return Object.fromEntries(entries)
  }
  else if (Array.isArray(v)) {
    return v.map(item => modifyKeysRecursive(item, fn))
  }
  else {
    return v
  }
}

export function fixPlayerData(playerData) {
  return modifyKeysRecursive(playerData, ([k, v]) => {
    if (k === "skills" && Array.isArray(v)) {
      // Skills
      return [[k, v], ["__magic__", 2], [`${k}__arrlen`, v.length]]
    }
    if (k === "items" && Array.isArray(v)) {
      // Inventory
      return [[k, v], ["__magic__", 103], [`${k}__arrlen`, v.length]]
    }
    if (typeof v === "string") {
      return [[k, v], [`${k}__strlen`, v.length]]
    }
    if (k.endsWith("__buf")) {
      return [[k, v], [`${k.slice(0, -3)}buflen`, v.length]]
    }
    if (Array.isArray(v)) {
      return [[k, v], [`${k}__arrlen`, v.length]]
    }
    if (k === "maxHealth") {
      // PlayerData
      return [[k, v], ["__magic__", 24]]
    }
    return [[k, v]]
  })
}

export function fixPlayerProfile(playerProfile) {
  return modifyKeysRecursive(playerProfile, ([k, v]) => {
    if (k === "playerName") {
      // PlayerProfile
      return [[k, v], [`${k}__strlen`, v.length], ["__magic__", 32]]
    }
    if (typeof v === "string") {
      return [[k, v], [`${k}__strlen`, v.length]]
    }
    if (k.endsWith("__buf")) {
      return [[k, v], [`${k.slice(0, -3)}buflen`, v.length]]
    }
    if (Array.isArray(v)) {
      return [[k, v], [`${k}__arrlen`, v.length]]
    }
    return [[k, v]]
  })
}

export function downloadBlob(blob, name = 'modified.fch') {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob);
  console.log("blobUrl", blobUrl);
  // Create a link element
  const link = document.createElement("a");

  // Set link's href to point to the Blob URL
  link.href = blobUrl;
  link.download = name;

  // Append link to the body
  document.body.appendChild(link);

  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', { 
      bubbles: true, 
      cancelable: true, 
      view: window 
    })
  );

  // Remove link from body
  document.body.removeChild(link);
}

export const dedent = (str) => ('' + str).replace(/(\n)\s+/g, '$1')