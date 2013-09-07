
VERSION=3
WDGT=xkcd.wdgt

$(WDGT).zip: version
	git archive -o $(WDGT).zip --prefix=$(WDGT)/ HEAD

version:
	sed -i '' '1,$$s/id="version">[0-9][0-9]*/id="version">$(VERSION)/' index.html
	python ./plist.py $(VERSION)

clean:
	rm -rf $(WDGT).zip
