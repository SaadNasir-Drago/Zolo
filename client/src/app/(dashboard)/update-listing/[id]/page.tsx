"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import CreateListing from "../../create-listing/page";
const Updatelisting = ({ params }: { params: { id: string } }) => {
  const [property, setProperty] = useState(null);
  const { id } = params; // This gets the dynamic `id` from the URL

  useEffect(() => {
    if (id) {
      axios
        .get(
          `https://railway.app/project/2ff822b9-c7df-426d-b0a1-a2b5b874b4e7/api/getProperty/${id}`
        )
        .then((response) => {
          setProperty(response.data);
        })
        .catch((error) => {
          console.error("Error fetching property data:", error);
        });
    }
  }, []);

  return (
    <div>
      <CreateListing {...(property ? { updateData: property } : {})} />
    </div>
  );
};

export default Updatelisting;
