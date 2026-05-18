export function deepMerge(base, patch) {
  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    const bv = base[key];
    if (pv && typeof pv === 'object' && !Array.isArray(pv)) {
      out[key] = deepMerge(bv && typeof bv === 'object' ? bv : {}, pv);
    } else {
      out[key] = pv;
    }
  }
  return out;
}
