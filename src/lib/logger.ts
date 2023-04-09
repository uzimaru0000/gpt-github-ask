import { Ora } from 'ora';
import { isImplementsShow } from '../error';

export const withSpinner =
  (spinner: Ora) =>
  async <T>(msg: string, fun: () => Promise<T>): Promise<T> => {
    spinner.start(msg);
    try {
      const res = await fun();
      spinner.succeed();
      return res;
    } catch (e) {
      if (isImplementsShow(e)) {
        spinner.fail(e.show());
      } else {
        spinner.fail('failed');
      }

      throw new Error('failed');
    }
  };
