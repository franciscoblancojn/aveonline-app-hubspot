import React, {  useEffect, useState } from "react";
import {  hubspot, Box , LoadingButton} from "@hubspot/ui-extensions";

hubspot.extend(({ actions, context }) => (
  <Extension actions={actions} context={context}  />
));

const Extension = ({ actions,context }) => {
  const [contact, setContact] = useState<any>(null);
  const [loader, setLoader] = useState(false)
  const getContact = async () => {
    setLoader(true)
    try {
      const data = await actions.fetchCrmObjectProperties(['firstname', 'lastname', "phone", "email"])
      data.id = context.crm.objectId;
      setContact(data)
    } catch (error) {
      console.error("Error obteniendo datos del contacto:", error);
      return null
    }finally{

    setLoader(false)
    }
  };
  useEffect(()=>{
    getContact()
  },[])
  return (
    <>
      <Box>
        <LoadingButton type="submit"  href={"https://chat.aveonline.co/en/inbox?id="+contact?.phone?.replaceAll("+",'')} loading={loader}>
          Abrir Chat
        </LoadingButton>
      </Box>
    </>
  );
};
