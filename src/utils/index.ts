export function isJson(str: string): boolean {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function addParamsToURL(url: string, params: any): string {
  const formattedURL = new URL(url);

  Object.entries(params)?.forEach((param) => {
    const [key, value] = param;
    formattedURL.searchParams.append(key, value as string);
  });

  return formattedURL.toString();
}
