export default {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext) {
    return new Response('Hello, world!');
  },
};