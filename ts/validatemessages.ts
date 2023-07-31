import { getLang } from "./localize";

const en_validateMessages = {
    required: '${label} is required!',
};

const pl_validateMessages = {
    required: 'Pole ${label} jest wymagane!',
};

function getValidateMessages() {

    const la = getLang()

    if (la === "pl") return pl_validateMessages
    return en_validateMessages;

}

export default getValidateMessages

