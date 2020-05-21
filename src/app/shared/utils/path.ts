import { join } from "path";

export default class PathUtils {

  public static resolvePath(path: string) {
      return join(__dirname, path);
  };

}