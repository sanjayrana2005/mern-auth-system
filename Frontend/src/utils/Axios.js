import axios from "axios"
const baseURL = import.meta.env.VITE_BASE_API_URL


const Axios = axios.create({
    baseURL,
    withCredentials:true,  // send cookie if using auth
    headers:{
        "Content-Type":"application/json"
    }
})

export default Axios