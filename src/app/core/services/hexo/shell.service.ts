import { Injectable } from "@angular/core";
import { exec } from "child_process";
import * as Shell from "shelljs";
import { portKill } from "../../../shared/utils/thread";
import { validPort } from "../../../shared/utils/validPort";
import { ConfigService } from "../config/config.service";
import { ElectronService } from "../electron/electron.service";

@Injectable({
  providedIn: "root",
})
export class HexoShellService {
  constructor(private electronService: ElectronService, private configService: ConfigService) {
    validPort(configService.config.defaultServerPort).then((value) => this.isServed = !value);
  }

  private runLock: boolean = false;

  public isServed: boolean;

  public run(rootPath: string) {
    if (!this.runLock) {
      this.runLock = true;
      if (!validPort(this.configService.config.defaultServerPort)) {
        this.electronService.error("ERROR.INVALID_PORT");
        return;
      }
      Shell.cd(rootPath);
      const command = "hexo server" + " --port " + this.configService.config.defaultServerPort;
      exec(command);
      validPort(this.configService.config.defaultServerPort).then((value) => this.isServed = !value);
    }
  }

  public stop() {
    validPort(this.configService.config.defaultServerPort).then((value) => {
      if(!value) {
        portKill(this.configService.config.defaultServerPort);
      }
      this.isServed = !value;
      this.runLock = false;
      this.electronService.success('SUCCESS.OPERATE');
    });
  }

}
