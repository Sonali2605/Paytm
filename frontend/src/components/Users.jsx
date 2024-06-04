import { useEffect, useState } from "react"
import { Button } from "./Button"
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Users = () =>{
    const [users, setUsers]  = useState([]);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        // Function to fetch users
        const fetchUsersData = () => {
            axios.get("http://localhost:3000/api/v1/user/bulk?filter=" + filter, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            .then(response => {
                setUsers(response.data.user);
            })
            .catch(error => {
                console.error("There was an error fetching the users!", error);
            });
        };
    
        // If filter is not empty, apply debouncing
        if (filter !== "") {
            const delayDebounceFn = setTimeout(fetchUsersData, 800);
            return () => clearTimeout(delayDebounceFn);
        } else {
            // If filter is empty, fetch users immediately
            fetchUsersData();
        }
    }, [filter]);

    return <>
    <div className="font-bold mt-6 text-lg">
        Users
    </div>
    <div className="my-2">
        <input type="text" onChange={(e)=>{
            setFilter(e.target.value)
        }} placeholder="Search users..." className="w-full px-2 py-1 border rounded border-slate-200"></input>
    </div>
    <div>
        {users.map(user =><User user = {user} />)}
    </div>
    </>
}

function User ({user}) {    
    const navigate = useNavigate();

    return <div className="flex justify-between">
        <div className="flex">
            <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                <div className="flex flex-col justify-center h-full text-xl">
                    {user.firstName[0]}
                </div>
            </div>
            <div className="flex flex-col justify-center h-ful">
                <div>
                    {user.firstName} {user.lastName}
                </div>
            </div>
        </div>
        <div className="flex flex-col justify-center h-ful">
            <Button onClick={(e) =>{
               navigate("/send?id=" + user._id + "&name=" + user.firstName)
            }} label={"Send Money"} />
        </div>
    </div>
}