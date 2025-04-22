import { AVECHAT_LIST_CAMPANA } from "../data/avechat-campana";

const main = async () => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify({
      published: true,
      label: "Avechat Enviar Template",
      actionUrl: "https://franciscoblanco.vercel.app/api/cache?id=test",
      objectTypes: ["CONTACT"],
      inputFields: [
        {
          typeDefinition: {
            name: "template",
            label: "Template",
            type: "enumeration",
            fieldType: "select",
            options: AVECHAT_LIST_CAMPANA.map((campana) => ({
              value: campana,
              label: campana,
            })),
            isRequired: false,
            description:
              "Plantillar el template que se va a usar para enviar el mensaje",
          },
          label: "Template",
          description:
            "Plantillar el template que se va a usar para enviar el mensaje",
          supportedValueTypes: ["STATIC_VALUE"],
          isRequired: false,
        },
      ],
      supportedValueTypes: ["STATIC_VALUE"],
      objectRequestOptions: {
        properties: ["email", "id", "phone","firstname","lastname"],
      },
      labels: {
        en: {
          inputFieldLabels: {
            template: "Template",
          },
          inputFieldDescriptions: {
            template:
              "Plantillar el template que se va a usar para enviar el mensaje",
          },
          actionName: "Avechat Enviar Template",
          actionDescription:
            "Hook a ejecutar para enviar Template de mensaje por Avechat",
          appDisplayName: "Avechat Enviar Template",
          actionCardContent: "Avechat Enviar Template",
        },
      },
    });

    const requestOptions = {
      method: "PATCH",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch(
      "https://api.hubapi.com/automation/v4/actions/9277520/205664900?hapikey=" +
        process.env.HAPIKEY,
      requestOptions
    );
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
};
main();
