#!/bin/zsh

 # fail if any command fails

 echo "🧩 Stage: Post-clone is activated .... "

 set -e
 # debug log
 set -x

 # Install dependencies using Homebrew. This is MUST! Do not delete.
 brew install node yarn cocoapods fastlane

 ls && cd .. && yarn --verbose && pod install --repo-update -verbose

 echo "🎯 Stage: Post-clone is done .... "

 exit 0