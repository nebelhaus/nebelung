{
  description = "Nebelung — Catppuccin Mocha with the blue stripped (theme builder)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    # whiskers (the Catppuccin templating CLI) is not in nixpkgs; it ships from
    # the catppuccin flake. This is the same input the consuming nix config
    # already has, so `follows` there keeps a single whiskers in the closure.
    catppuccin.url = "github:catppuccin/nix";
  };

  outputs =
    { self, nixpkgs, catppuccin }:
    let
      systems = [ "aarch64-darwin" "x86_64-darwin" "aarch64-linux" "x86_64-linux" ];
      forSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      # The Nebelung palette as a plain name -> "#hex" attrset, read from the
      # committed hex map. Nix-native consumers that can't take a rendered file
      # (e.g. a starship `[palettes.*]` table) inject this directly — no
      # duplication, the JSON stays the single source of truth.
      palette = builtins.mapAttrs (_: v: "#${v}") (
        builtins.fromJSON (builtins.readFile ./palette/nebelung.hex.json)
      );

      packages = forSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          whiskers = catppuccin.packages.${system}.whiskers;

          nebelung-themes = pkgs.stdenv.mkDerivation {
            pname = "nebelung-themes";
            version = "1.0.0";
            src = ./.;

            # node -> regenerate the palette + emit the vscode snippet;
            # whiskers -> render every port template. Both must be on PATH;
            # find/sed/cut/paste/xargs come from stdenv.
            nativeBuildInputs = [ pkgs.nodejs whiskers ];

            # No network, no npm deps (scripts use only Node built-ins).
            buildPhase = ''
              runHook preBuild
              bash build.sh
              runHook postBuild
            '';

            # dist/<port>/... mirrors the layout home-manager sources from;
            # preview + palette JSON tag along for reference.
            installPhase = ''
              runHook preInstall
              mkdir -p "$out/preview"
              cp -R dist/. "$out/"
              cp preview/nebelung.html "$out/preview/"
              cp palette/nebelung.json palette/nebelung.hex.json "$out/"
              runHook postInstall
            '';
          };
        in
        {
          default = nebelung-themes;
          nebelung-themes = nebelung-themes;
        }
      );
    };
}
