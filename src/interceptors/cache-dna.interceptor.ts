import {
  /* inject, */
  bind,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import { RestBindings } from '@loopback/rest';
const redis = require("redis");
const client = redis.createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOST);

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@bind({ tags: { key: CacheDnaInterceptor.BINDING_KEY } })
export class CacheDnaInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = 'CacheDna';

  /*
  constructor() {}
  */

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      const req = await invocationCtx.get(RestBindings.Http.REQUEST);
      const id = req.body.dna.toString().replace(/,/g, '');
      const promise = new Promise((reject, resolve) => {
        client.get(id, (err: any, res: any) => {
          if (err || !res)
            reject(err);
          resolve(res);
        });
      });

      const cache = (await Promise.all([promise]))[0];

      if (cache)
        return cache;

      const result = await next();

      if (!result) {
        const err = this.setError(403, 'Forbidden', 'The sequence is not mutant');
        client.setex(id, 1200, JSON.stringify(err));
        throw err;
      }

      client.setex(id, 1200, '');
      return '';

    } catch (err) {
      if (typeof err === 'string')
        err = JSON.parse(err);
      throw err;
    }
  }

  setError(statusCode: number, name: string, message: string) {
    return Object.assign(new Error(), {
      statusCode,
      name,
      message
    });
  }
}
