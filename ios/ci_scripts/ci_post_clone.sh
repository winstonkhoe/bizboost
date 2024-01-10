#!/bin/zsh

 # fail if any command fails

 echo "🧩 Stage: Post-clone is activated .... "

 set -e
 # debug log
 set -x

 # Install dependencies using Homebrew. This is MUST! Do not delete.
 brew install node yarn cocoapods fastlane

 ls && cd .. && yarn && pod install --repo-update

 echo "🎯 Stage: Post-clone is done .... "

 exit 0