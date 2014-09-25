======== LUNA HTTP Server ========
Written by Alex Alksne (500 357 261). Submitted for the CPS730 course (Assignment 1) at Ryerson University on Sept. 25th, 2014.

Usage: node luna.js [OPTION]
Run the LUNA HTTP Server while applying any passed in OPTIONs
Example: node luna.js -p 9001

  -p                        run on a specified port (must be betweenn 0 and 65535)
  -d                        run in debug mode (prints all INFO messages to console)
  --help                    display this help and exit

======== DEPENDENCIES ========
LUNA runs on node.js (www.nodejs.org). Since the e-mail filter at Ryerson won't let me send binaries, you'll have to download the node binary (the 32-bit, linux version) from www.nodejs.org/download; the download is very quick - sorry for the inconvenience! Once that's done, just run: "node luna.js" to start the server. If there are any problems feel free to contact me at any time at alex.alksne@ryerson.ca or (416) 999 - 4176.

NOTE: If you're running this on a non-linux 32-bit environment, you'll have to download the appropriate node binary (www.nodejs.org/download) for your system.

==== MISC. ====
I've reformatted myhttpd.conf to be machine-readable (JSON); its structure has changed but its semantic value is identical to the one shown to us by the professor.