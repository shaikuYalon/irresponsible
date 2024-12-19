import axios from "axios";

// יצירת מופע Axios עם הגדרות ברירת מחדל
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api", // הכתובת הבסיסית של השרת
});

// הוספת Interceptor להוספת הטוקן לכל בקשה
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token"); // שליפת הטוקן מה-sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // הוספת הטוקן לכותרת Authorization
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
