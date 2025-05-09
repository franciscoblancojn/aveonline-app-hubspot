# App
Hubspot necesitaba una forma de enviar desde el contacto hasta el chat en avechat, para eso se creo una App en Hubspot, esta app esta alojada en https://github.com/franciscoblancojn/aveonline-app-hubspot

Esta App crear una card para la pagina de contacto en detalle que agregar un botton que envia al chat de avechat directamente.

![Alt App](https://github.com/franciscoblancojn/aveonline-app-hubspot/blob/master/img/btn_ave_chat.png?raw=true "App")

## Upload change
En caso de hacer cambios al app para subir dichos cambios se debe ejecutar el comando:
```bash
npm run upload
```

## Card Avechat
El codigo del componente esta en https://github.com/franciscoblancojn/aveonline-app-hubspot/blob/master/src/app/extensions/ExampleCard.tsx, este se puede modificar para cambiar funcionalidad o estilos del boton "Abrir Chat", teniendo en cuenta las limitaciones del app de hubspot, estas limitaciones son como:
1) No abrir un iframe interno,
2) Los componentes que se pueden usar son de "**@hubspot/ui-extensions**"
3) as peticiones para obtener datos de usuario se hace con actions y context del componente
