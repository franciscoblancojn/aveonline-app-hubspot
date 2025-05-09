# Custom Actions
Para el manejo de hubspot conectado a avechat es necesario tener custom actions personalizado para ejecutar en los flujos, el codigo esta en [https://github.com/franciscoblancojn/aveonline-app-hubspot/tree/master/backend/hubspot_custom_action](https://github.com/franciscoblancojn/aveonline-app-hubspot/tree/master/backend/hubspot_custom_action)

**Todos los enpoint para modificar los custom actions estan en [https://github.com/franciscoblancojn/aveonline-app-hubspot/blob/master/backend/hubspot_custom_action/Hubsport%20Custom%20Action.postman_collection.json](https://github.com/franciscoblancojn/aveonline-app-hubspot/blob/master/backend/hubspot_custom_action/Hubsport%20Custom%20Action.postman_collection.json)**

1) ## Enviar mensajes por AveChat
Este custom action permite enviar un mensaje a una lista de contactos por medio de avechat usando el api https://avechat-hubspot.api.aveonline.co/api/callback/hubspot/send-message con un formato de mensaje:

_Tenga en cuenta que el mensaje tiene este formato : Hola {{name}}, quería comentarte que {{message}}_

![Alt text](https://github.com/franciscoblancojn/aveonline-app-hubspot/blob/master/backend/hubspot_custom_action/img/send_message.png?raw=true "Enviar mensajes por AveChat")



2) ## Action Create Contact
Este custom action permite crear un usuario en avechat desde hubspot a traves de el enpoint https://avechat-hubspot.api.aveonline.co/api/callback/hubspot/create-conctact

![Alt text](https://github.com/franciscoblancojn/aveonline-app-hubspot/blob/master/backend/hubspot_custom_action/img/create_contact.png?raw=true "Action Create Contact")


3) ## Action Send Template
Este custom action permite enviar un template mensaje a una lista de contactos por medio de avechat usando el api https://avechat-hubspot.api.aveonline.co/api/callback/hubspot/send-message-template

**IMPORTANTE este action no se edita desde la colección de postman, este se edita por medio del script loadCustomActionAveChat el cual se ejecuta en el repositorio https://github.com/franciscoblancojn/aveonline-app-hubspot con el comando:**
```bash
npm run backend-loadCustomActionAveChat
```
Este comando carga las lista de template de campañas en el custom action como una lista.

![Alt text](https://github.com/franciscoblancojn/aveonline-app-hubspot/blob/master/backend/hubspot_custom_action/img/send_template.png?raw=true "Action Send Template")
