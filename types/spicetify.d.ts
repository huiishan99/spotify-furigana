interface SpicetifyPlaybarButton {
  active: boolean;
  label: string;
  deregister(): void;
  register(): void;
}

interface SpicetifyGlobal {
  Config?: {
    version?: string;
    custom_apps?: string[];
  };
  Platform: unknown;
  Player: unknown;
  LocalStorage: {
    get(key: string): string | null;
    set(key: string, value: string): void;
  };
  Playbar: {
    Button: new (
      label: string,
      icon: string,
      onClick: (self: SpicetifyPlaybarButton) => void,
      disabled?: boolean,
      active?: boolean,
      registerOnCreate?: boolean,
    ) => SpicetifyPlaybarButton;
  };
  showNotification(message: string, isError?: boolean): void;
}

declare const Spicetify: SpicetifyGlobal;
