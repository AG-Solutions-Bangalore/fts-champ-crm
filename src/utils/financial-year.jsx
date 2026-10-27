import axios from "axios";
import Cookies from "js-cookie";
import BASE_URL from "@/config/base-url";

/**
 * Gets current financial year from cookie or system date
 */
export const getCurrentFinancialYear = () => {
  const cookieYear = Cookies.get("currentYear");
  if (cookieYear) return cookieYear;
  const now = new Date();
  const calYear = now.getFullYear();
  const calMonth = now.getMonth(); // 0 = Jan, 3 = April
  const startYr = calMonth < 3 ? calYear - 1 : calYear;
  return `${startYr}-${String(startYr + 1).slice(-2)}`;
};

/**
 * Fetches Financial Years.
 * Checks Cookies for `currentYear` first. If present, returns it directly WITHOUT calling panel-fetch-year API.
 * Only calls API if cookie is not set.
 */
export const fetchFinancialYearsFromApi = async () => {
  const cookieYr = Cookies.get("currentYear");
  if (cookieYr) {
    return [cookieYr];
  }

  try {
    const token = Cookies.get("token");
    if (!token) {
      return [getCurrentFinancialYear()];
    }

    const res = await axios.get(`${BASE_URL}/api/panel-fetch-year`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const yearsSet = new Set();
    const data = res.data;
    const yData = data?.year;

    if (typeof yData === "object" && yData !== null) {
      if (yData.current_year) yearsSet.add(String(yData.current_year).trim());
      if (Array.isArray(yData.years)) {
        yData.years.forEach((y) => y && yearsSet.add(String(y).trim()));
      }
      if (Array.isArray(yData.year_list)) {
        yData.year_list.forEach((y) => y && yearsSet.add(String(y).trim()));
      }
    } else if (typeof yData === "string" && yData.trim()) {
      yearsSet.add(yData.trim());
    }

    if (Array.isArray(data?.years)) {
      data.years.forEach((y) => y && yearsSet.add(String(y).trim()));
    }
    if (Array.isArray(data?.year_list)) {
      data.year_list.forEach((y) => y && yearsSet.add(String(y).trim()));
    }
    if (data?.current_year) {
      yearsSet.add(String(data.current_year).trim());
    }

    if (yearsSet.size > 0) {
      return Array.from(yearsSet);
    }

    return [getCurrentFinancialYear()];
  } catch (err) {
    console.error("Error fetching financial year from API:", err);
    return [getCurrentFinancialYear()];
  }
};
