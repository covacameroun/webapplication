import React from "react";

function FormInsurance() {
  const postData: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    const formData = new FormData(event.currentTarget);

    const nomAssurance = formData.get("nomAssurance");
    const phoneNumber = formData.get("phoneNumber");

    try {
      const response = await fetch(
        "http://13.51.234.225:8090/api/insurances/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3b3RhZGlAZ21haWwuY29tIiwiaWF0IjoxNzA0Mjg1NDA3LCJleHAiOjE3MDQzMDQ2MDd9.3QKFTXY5lMw4-t8BwuZL2ExKuhdqtvFVwkBcQpS9aKw",
          },
          body: JSON.stringify({ nomAssurance, phoneNumber }),
        }
      );
      const data = await response.json();
      console.log("Response from server:", data);
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-center font-bold text-xl text-red-500">
          Bonjour ma mon premier test
        </h1>
        <form onSubmit={postData}>
          <div className="flex flex-col gap-2 items-center p-[20px]">
            <div className="p-2  gap-8 m-2 flex flex-col">
              <label>Nom assurance</label>
              <input
                type="text"
                name="nomAssurance"
                placeholder="Enter your name"
              />
            </div>
            <div className="p-2 gap-8 m-2 flex flex-col">
              <label>Phone number</label>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <button type="submit">Submit</button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default FormInsurance;
