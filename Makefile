
WDGT:=xkcd.wdgt
ID:=BD2361EF6D805EA18B6976E4B7EBD06D589B95AB

$(WDGT).zip:
	git archive -o $(WDGT).zip --prefix=$(WDGT)/ HEAD
	@#unzip $(WDGT).zip
	@#codesign -v -s $(ID) $(WDGT)
	@#zip -r $(WDGT).zip $(WDGT)
	@#rm -rf $(WDGT)


clean:
	rm -rf $(WDGT) $(WDGT).zip
