import { handleApi, type Env } from "../../worker/api";

export const onRequest: PagesFunction<Env> = async (context) => {
  return handleApi(context.request, context.env);
};
