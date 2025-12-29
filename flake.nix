{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    utils.url = "github:numtide/flake-utils";
  };
  outputs = { nixpkgs, utils, ... }: utils.lib.eachDefaultSystem (system: let
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    packages.default = pkgs.buildNpmPackage {
      pname = "spill-site";
      version = "0.0.1";
      src = ./.;
      nodejs = pkgs.nodejs_20;
      npmDepsHash = "sha256-WmFvUroF1CqLFxnaqA1YMi3etCZWr5CWPcWsn/Tsomw=";
    };
    devShells.default = pkgs.mkShell {
      buildInputs = [ pkgs.nodejs_20 ];
    };
  });
}