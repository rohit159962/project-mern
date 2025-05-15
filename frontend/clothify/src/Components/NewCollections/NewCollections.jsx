import React from "react";
import "./NewCollections.css";
import new_collections from "../Assets/new_collections";
import { Item } from "../Item/Item";
import { useState } from "react";
import { useEffect } from "react";
export const NewCollections = () => {
  const[new_collection,setNew_collection] = useState([]);
  useEffect(() => {
    fetch("https://project-mern-rdok.onrender.com/newcollections")
      .then((res) => res.json())
      .then((data) => setNew_collection(data));
  },[])
  return (
    <div className="new-collections">
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {new_collections.map((item, i) => {
          return (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          );
        })}
      </div>
    </div>
  );
};
