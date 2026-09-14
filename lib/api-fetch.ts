/**
 * MIDEM GLOBAL API FETCH
 *
 * Faqat apiFetch() orqali yuborilgan requestlar
 * global loader bilan bog'lanadi.
 *
 * Oddiy fetch() requestlariga tegmaydi.
 */

interface ApiFetchOptions extends RequestInit {
  /**
   * Loaderni ishlatish kerakmi?
   *
   * Default: true
   */
  loader?: boolean;
}

function dispatchLoaderEvent(
  eventName: "midem:global-loading-start" | "midem:global-loading-finish",
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(eventName));
}

export async function apiFetch(
  input: RequestInfo | URL,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { loader = true, ...fetchOptions } = options;

  /*
   * API request boshlanishi
   */
  if (loader) {
    dispatchLoaderEvent("midem:global-loading-start");
  }

  try {
    const response = await fetch(input, {
      ...fetchOptions,

      /*
       * Browser cache sabab eski data kelib,
       * loader noto'g'ri tez yopilib qolmasligi uchun.
       */
      cache: fetchOptions.cache ?? "no-store",
    });

    /*
     * RESPONSE KELDI
     *
     * Muhim:
     *
     * response kelishi bilan loaderni yopamiz.
     * JSON parse qilishni kutmaymiz.
     *
     * Shuning uchun UI:
     *
     * API → response → loader fade/blur
     *       ↓
     * JSON parse → state update
     *
     * tarzida ishlaydi.
     */
    if (loader) {
      dispatchLoaderEvent("midem:global-loading-finish");
    }

    return response;
  } catch (error) {
    /*
     * API xato bersa ham loader abadiy turib qolmasin.
     */
    if (loader) {
      dispatchLoaderEvent("midem:global-loading-finish");
    }

    throw error;
  }
}
