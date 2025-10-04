"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/AuthProvider";

function Pending() {
    const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const {user}=useAuth();
  const[userId,setUserId]=useState(user._id)
  const [reqId,setReqId]=useState()

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch("/api/get-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        console.log(data)
        if (res.ok) {
          setRequest(data.request);
          setReqId(data.request._id)
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [userId]);


  const handleDelete=async()=>{
    try {
        const res=await fetch("/api/get-request",{
            method:"DELETE",
            headers: { "Content-Type": "application/json" },
            body:JSON.stringify({reqId})
        })
        
        if(res.ok){
           const data=await res.json();
            console.log("Request removed Successfully!!!");
            setRequest(null);
            setReqId(null);
        }
    } catch (error) {
        console.log(error)
    }
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (!request)
    return <p className="p-6">No pending seller request. Click "Become a Seller" to send a request.</p>;
  return (
    <div className="">
      <div className="max-w-md mx-auto bg-white shadow rounded-lg border-t-4 border-green-500">
        <div className="p-2 border-b flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold text-green-500 text-center">Seller Request Status</h2>
          <p className="">
           <span
              className={`text-sm text-white px-4 py-1 rounded-full ${
                request.status === "pending"
                  ? "bg-yellow-500"
                  : request.status === "accepted"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              {request.status}
            </span> 
          </p>
        </div>

        <div className="p-4">
          <p className="w-[100%] flex items-center justify-center">
            
            {request.shopLogo ? (
              <img
                src={request.shopLogo}
                alt="Shop Logo"
                className="inline-block w-24 h-24 rounded-full shadow-2xl"
              />
            ) : (
              "N/A"
            )}
          </p>
          <p className="mt-4">
            <strong className="mr-2">Shop Name:</strong> {request.shopName}
          </p>
          <p className="text-justify overflow-hidden">
            <strong className="mr-2">Description:</strong > {request.shopDescription || "N/A"}
          </p>
          
          <p className="flex flex-col gap-2">
            <strong>Certificate:</strong>{" "}
            {request.shopCertificate ? (
              <img
                src={request.shopCertificate}
                alt="Certificate pic"
                className="rounded-md shadow-sm h-50"
              />
            ) : (
              "N/A"
            )}
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-5">
        <button className="bg-rose-500 py-1 px-3 rounded-md text-white cursor-pointer hover:bg-rose-700 hover:shadow-md" onClick={handleDelete}>Remove Request</button>
      </div>
    </div>
  )
}

export default Pending
