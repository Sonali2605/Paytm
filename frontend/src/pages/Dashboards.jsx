import { useEffect, useState } from "react"
import { Appbar } from "../components/Appbar."
import { Balance } from "../components/Balance"
import { Users } from "../components/Users"
import axios from "axios"

export const Dashboard = () =>{
    const [myBalance, SetMyBalance] = useState(0);

    useEffect(()=>{
        axios.get("http://localhost:3000/api/v1/account/balance",{
            headers:{
                Authorization:`Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(response =>{
            SetMyBalance(response.data.balance)
        })
    },[])
    return <div>
        <Appbar/>
        <div className="m-8">
            <Balance value= {myBalance}/>
            <Users/>
        </div>
    </div>
}