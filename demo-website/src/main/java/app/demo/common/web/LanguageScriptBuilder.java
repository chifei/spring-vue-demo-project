package app.demo.common.web;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import java.util.List;
import java.util.Map;


public class LanguageScriptBuilder {
    public List<Map<String, String>> build() {
        Map<String, String> en = Maps.newHashMap();
        en.put("language", "en-US");
        en.put("displayName", "English");

        return Lists.newArrayList(en);
    }
}
