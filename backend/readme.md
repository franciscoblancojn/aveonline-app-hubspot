# Api

Hubspot y avechat se comunican por medio de un api intermedia alojada en https://avechat-hubspot.api.aveonline.co

## Enpoints

El api intermedia tiene distintos enpoints para distintas funcionalidades:

1. ### **[POST] /api/create-note**
   Permite guardar mensajes en Hubspot como Notas.

```js
// Body example
{
  "contactId":"105323010669",
  "message":"Hola"
}
```

2. **[GET] /api/log?cache=key**
   Permite obtener datos guardados en cache, ya sea guardados manualmente o guardados por otros enpoints.

```js
// Results example
{
  "cachedData":{
    //...data
  }
}
```

3. **[POST] /api/log?cache=key**
   Permite guardar datos guardados en cache manualmente.

```js
// Body example
{
  //...data
}
```

4. **[POST] /api/callback/ave-chat/create-contact**
   Enpoint que se ejecuta desde avechat después de crear un nuevo usuario.
   Esta función crea e contacto en **hubspot**, luego crear una empresa(con los mismo datos del usuario), luego crear o conecta con un **lead en ave** y asigna un asesor comercial y logístico en caso de que lo tenga en ave, termina guardando dichos datos en avechat

```js
// Body example
{
"id": "573103557200",
"first_name": "Francisco",
"last_name": "",
"full_name": "Francisco",
"email": "",
"phone": "+573103557200"
}
```

5. **[POST] /api/ave-chat/create-contact**
   Enpoint para crear un contacto en avechat manualmente y asignarle asesor comercial

```js
// Body example
{
"id": "573103557200",
"url_ave_pre_register": "",
"id_hs": "1234567",
"email_asesor_comercial": "asesor@asesor.com",
"first_name": "Francisco",
"last_name": "",
"email": "",
"phone": "+573103557200"
}
```

6. **[GET] /api/n_asesor_comercial**
   Enpoint para obtener el numero actual de la cola de asignación de asesor comercial.

```js
// Result example
{
  success: true,
  n_asesor_comercial:1
}
```

7. **[POST] /api/n_asesor_comercial**
   Enpoint para aumentar en 1 el numero actual de la cola de asignación de asesor comercial.

8. **[POST] /api/callback/ave-chat/asignar-asesor-comercial**
   Enpoint para asignar asesor comercial con la cola de asignación .

```js
// Body example
{
"id": "573103557200"
}
```

9. **[POST] /api/callback/ave-chat/asignar-asesor-logistico**
   Enpoint para asignar asesor logistico con la cola de asignación.

```js
// Body example
{
"id": "573103557200"
}
```

10. **[POST] /api/ave-chat/asignar-asesor-logistico**
    Enpoint para asignar asesor logistico pasado por parametros.

```js
// Body example
{
"id": "573103557200",
"email_asesor_logistico":"asesor"
}
```

11. **[POST] /api/ave-chat/save-all-chat?type=(logistico | comercial |cartera)**
    Enpoint para guardar el chat del usuario en hubspot tomando la variable **all_chat** y validando con **time_last_input** si x mensaje ya se guardo en hubspot.

```js
// Body example
{
"id": "573103557200",
"id_hs":"12313213",
"time_last_input":"",
"first_name": "Francisco",
"last_name": "",
"email": "",
"phone": "+573103557200",
"email_asesor_cartera": "",
"email_asesor_comercial": "",
"email_asesor_logistico": ""
}
```

12. **[POST] /api/ave-chat/change-custom-field**
    Enpoint para guardar variables personalizadas en un usuario.

```js
// Body example
{
  "user_id": "573103557200",
  "fields":{
    "variable":"value",
    "variable2":"value2",
    "variable3":"value3"
  }
}
```

13. **[POST] /api/ave-chat/send-message**
    Enpoint para enviar un mensaje a un usuario.

```js
// Body example
{
  "user_id": "573103557200",
  "message":"message"
}
```

14. **[POST] /api/callback/hubspot/send-message**
    Enpoint que se ejecuta al enviar un mensaje a trabes de hubspot por medio de custon action "Avechat", este mensaje es almacenado y enviado al usuario por medio de avechat.

```js
// Body example
{
"callbackId": "ap-47355542-1589400750477-3-0",
"origin": {
"portalId": 47355542,
"actionDefinitionId": 201903771,
"actionDefinitionVersion": 4,
"actionExecutionIndexIdentifier": {
"enrollmentId": 1589400750477,
"actionExecutionIndex": 0
},
"extensionDefinitionId": 201903771,
"extensionDefinitionVersionId": 4
},
"context": {
"workflowId": 1640937852,
"actionId": 3,
"actionExecutionIndexIdentifier": {
"enrollmentId": 1589400750477,
"actionExecutionIndex": 0
},
"source": "WORKFLOWS"
},
"object": {
"objectId": 108456792064,
"objectType": "CONTACT"
},
"fields": {
"message": "test message"
},
"inputFields": {
"message": "test message"
}
}
```

15. **[POST] /api/hubspot/create-company**
    Enpoint para crear company en hubspot.

```js
// Body example
{
  "id_hs": "123456", // id del usuario a asosciar
  "name":"name",
  "phone":"573103557200"
}
```

16. **[POST] /api/callback/hubspot/create-conctact**
    Enpoint que se ejecuta cuando se crea un usuario en hubspot, este crear el contacto en avechat si no existe.

17. **[POST] /api/callback/ave-chat/change-nit**
    Enpoint que se ejecuta cuando se cambia el **NIT** en avechat, busca una company que tenga ese nit como documento, si al encuentra tomas su asesor comercial y logístico, y se lo asigna en avechat.

```js
// Body example
{
  "NIT": "123456",
  "id_hs":"1231232",
  "phone":"573103557200"
}
```

18. **[POST] /api/ave-chat/change-nit**
    Enpoint para cambiar el **NIT** y **id_company_hs** manualmente .

```js
// Body example
{
  "NIT": "123456",
  "id_company_hs":"1231232",
  "phone":"573103557200"
}
```

19. **[POST] /api/callback/hubspot/send-message-template**
    Enpoint que se ejecuta al enviar un tempate a trabes de hubspot por medio de custon action "Avechat Enviar Template", este mensaje es almacenado y enviado al usuario por medio de avechat campañas.

```js
// Body example
{
"callbackId": "ap-47355542-1589400750477-3-0",
"origin": {
"portalId": 47355542,
"actionDefinitionId": 201903771,
"actionDefinitionVersion": 4,
"actionExecutionIndexIdentifier": {
"enrollmentId": 1589400750477,
"actionExecutionIndex": 0
},
"extensionDefinitionId": 201903771,
"extensionDefinitionVersionId": 4
},
"context": {
"workflowId": 1640937852,
"actionId": 3,
"actionExecutionIndexIdentifier": {
"enrollmentId": 1589400750477,
"actionExecutionIndex": 0
},
"source": "WORKFLOWS"
},
"object": {
"objectId": 108456792064,
"objectType": "CONTACT"
},
"fields": {
"template": "template"
},
"inputFields": {
"template": "template"
}
}
```
