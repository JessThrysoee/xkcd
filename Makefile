
VERSION=2
WDGT=xkcd.v$(VERSION).wdgt

$(WDGT).zip: version
	git archive -o $(WDGT).zip --prefix=$(WDGT)/ HEAD

version:
	sed -i '' '1,$$s/id="version">[0-9][0-9]*/id="version">$(VERSION)/' index.html

clean:
	rm -rf xkcd.v*.zip
