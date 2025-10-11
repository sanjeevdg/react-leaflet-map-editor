import * as L from "leaflet";

declare module "leaflet" {
  namespace Draw {
    namespace Event {
      const CREATED: string;
      const EDITED: string;
      const DELETED: string;
      const DRAWSTART: string;
      const DRAWSTOP: string;
      const EDITSTART: string;
      const EDITSTOP: string;
      const DELETESTART: string;
      const DELETESTOP: string;
    }

    class Toolbar extends L.Control {}

    namespace Toolbar {
      class Action {
        constructor(map: L.Map, toolbar: Toolbar, options?: any);
        enable(): void;
        disable(): void;
      }
    }

    namespace Handler {
      class Draw extends L.Handler {}
    }
  }
}
