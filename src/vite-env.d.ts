/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-svgr/client" />

declare const VITE_VERSION: string;

declare module '@3d-dice/dice-box' {
  interface DiceBoxConfig {
    assetPath: string;
    gravity?: number;
    mass?: number;
    friction?: number;
    restitution?: number;
    angularDamping?: number;
    linearDamping?: number;
    spinForce?: number;
    throwForce?: number;
    startingHeight?: number;
    settleTimeout?: number;
    offscreen?: boolean;
    delay?: number;
    scale?: number;
    theme?: string;
    themeColor?: string;
    origin?: string;
  }

  interface DieResult {
    value: number;
    sides: number;
  }

  export default class DiceBox {
    constructor(selector: string, config: DiceBoxConfig);
    init(): Promise<void>;
    roll(notation: string, options?: object): Promise<DieResult[]>;
    add(notation: string | object, options?: object): Promise<DieResult[]>;
    clear(): this;
    onRollComplete: (results: DieResult[]) => void;
    onDieComplete: (result: DieResult) => void;
    onBeforeRoll: (notation: object) => void;
    onRemoveComplete: (result: DieResult) => void;
    onThemeConfigLoaded: (themeData: object) => void;
    onThemeLoaded: (theme: string) => void;
    updateConfig(config: Partial<DiceBoxConfig>): void;
    getRollResults(): DieResult[];
  }
}