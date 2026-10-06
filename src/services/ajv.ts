import Ajv from "ajv";
import {schema as patch, type patchRequest} from "../schemas/patchRequest.js";

class Validator
{
    private ajv: Ajv.default
    patch : Ajv.ValidateFunction<patchRequest>;
    constructor()
    {
        this.ajv = new Ajv.default({allErrors: true});
        this.patch = this.ajv.compile(patch);
    }
}
const validate = new Validator();
export default validate;