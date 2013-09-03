import sys
import plistlib

##
## update version in Info.plist
##
## usage: python ./plist.py 6
##

version = sys.argv[1]
infoPlist = 'Info.plist'

info = plistlib.readPlist(infoPlist)
info['CFBundleShortVersionString'] = version
info['CFBundleVersion'] = version

plistlib.writePlist(info, infoPlist)

