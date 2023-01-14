[Setup]
pip3 install solc-select
solc-select install (** Solidity Version **)
solc-select use (** Solidity Version **)
pip3 install slither-analyzer

[Audit]
slither ./contracts --solc-remaps '@openzeppelin=node_modules/@openzeppelin @chainlink=node_modules/@chainlink' --exclude naming-convention,external-function,low-level-calls --buidler-ignore-compile

[env]
source ~/.bash_profile