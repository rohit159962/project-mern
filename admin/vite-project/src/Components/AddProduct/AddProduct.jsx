import React from "react";
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";
import { useState } from "react";

const AddProduct = () => {
  const [image, setImage] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "women",
    old_price: "",
    new_price: "",
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const ADD_Product = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }

    let product = { ...productDetails };

    try {
      let formData = new FormData();
      formData.append("product", image);

      const uploadResponse = await fetch("https://project-mern-rdok.onrender.com/upload", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      // Check if response is JSON
      const contentType = uploadResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await uploadResponse.text();
        console.error("Non-JSON response from /upload:", text);
        throw new Error(`Expected JSON, got ${contentType || "unknown"}: ${text.slice(0, 100)}`);
      }

      const responseData = await uploadResponse.json();
      console.log("Upload response:", responseData);

      if (responseData.success) {
        product.image = responseData.image_url;
        console.log("Product to add:", product);

        const addResponse = await fetch("https://project-mern-rdok.onrender.com/addproduct", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        });

        // Check if addResponse is JSON
        const addContentType = addResponse.headers.get("content-type");
        if (!addContentType || !addContentType.includes("application/json")) {
          const text = await addResponse.text();
          console.error("Non-JSON response from /addproduct:", text);
          throw new Error(`Expected JSON, got ${addContentType || "unknown"}: ${text.slice(0, 100)}`);
        }

        const addData = await addResponse.json();
        console.log("Add product response:", addData);

        if (addData.success) {
          alert("Product Added Successfully");
        } else {
          alert("Failed to Add Product: " + (addData.message || "Unknown error"));
        }
      } else {
        alert("Image Upload Failed: " + (responseData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Type here"
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="text"
            name="old_price"
            placeholder="Type here"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="text"
            name="new_price"
            placeholder="Type here"
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector"
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kids</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            className="addproduct-thumbnail-img"
            alt=""
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          id="file-input"
          name="image"
          hidden
        />
      </div>
      <button
        onClick={ADD_Product}
        className="addproduct-btn"
      >
        ADD
      </button>
    </div>
  );
};

export default AddProduct;
