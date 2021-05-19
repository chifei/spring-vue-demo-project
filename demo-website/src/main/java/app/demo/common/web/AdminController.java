package app.demo.common.web;


import app.demo.common.util.JSONBinder;
import app.demo.common.util.Messages;
import app.demo.common.web.interceptor.LoginRequired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.inject.Inject;
import java.util.Map;


@Controller
public class AdminController {
    @Inject
    Messages messages;

    @Inject
    UserPreference userPreference;

    @Inject
    UserInfo userInfo;

    @RequestMapping(value = "/admin/", method = RequestMethod.GET)
    @LoginRequired
    public String index(Map<String, Object> model) {
        Map<String, String> messages = this.messages.getMessages(userPreference.locale());
        model.put("messages", "window.messages=" + JSONBinder.toJSON(new MessagesScriptBuilder(messages).build()));
        model.put("user", "window.user=" + JSONBinder.toJSON(new UserInfoScriptBuilder(userInfo).build()));
        model.put("languages", "window.languages=" + JSONBinder.toJSON(new LanguageScriptBuilder().build()));
        return "/app.html";
    }

    @RequestMapping(value = "/admin/md", method = RequestMethod.GET)
    @LoginRequired
    public String mdIndex(Map<String, Object> model) {
        return mdAdmin(model);
    }

    @RequestMapping(value = "/admin/md/**/*", method = RequestMethod.GET)
    @LoginRequired
    public String mdAdmin(Map<String, Object> model) {
        Map<String, String> messages = this.messages.getMessages(userPreference.locale());
        model.put("messages", "window.messages=" + JSONBinder.toJSON(new MessagesScriptBuilder(messages).build()));
        model.put("user", "window.user=" + JSONBinder.toJSON(new UserInfoScriptBuilder(userInfo).build()));
        model.put("languages", "window.languages=" + JSONBinder.toJSON(new LanguageScriptBuilder().build()));
        return "/md-product.html";
    }

    @RequestMapping(value = "/admin/el", method = RequestMethod.GET)
    @LoginRequired
    public String elIndex(Map<String, Object> model) {
        return elAdmin(model);
    }

    @RequestMapping(value = "/admin/el/**/*", method = RequestMethod.GET)
    @LoginRequired
    public String elAdmin(Map<String, Object> model) {
        Map<String, String> messages = this.messages.getMessages(userPreference.locale());
        model.put("messages", "window.messages=" + JSONBinder.toJSON(new MessagesScriptBuilder(messages).build()));
        model.put("user", "window.user=" + JSONBinder.toJSON(new UserInfoScriptBuilder(userInfo).build()));
        model.put("languages", "window.languages=" + JSONBinder.toJSON(new LanguageScriptBuilder().build()));
        return "/el-product.html";
    }

    @RequestMapping(value = "/admin/mdl", method = RequestMethod.GET)
    @LoginRequired
    public String mdlIndex(Map<String, Object> model) {
        return mdlAdmin(model);
    }

    @RequestMapping(value = "/admin/mdl/**/*", method = RequestMethod.GET)
    @LoginRequired
    public String mdlAdmin(Map<String, Object> model) {
        Map<String, String> messages = this.messages.getMessages(userPreference.locale());
        model.put("messages", "window.messages=" + JSONBinder.toJSON(new MessagesScriptBuilder(messages).build()));
        model.put("user", "window.user=" + JSONBinder.toJSON(new UserInfoScriptBuilder(userInfo).build()));
        model.put("languages", "window.languages=" + JSONBinder.toJSON(new LanguageScriptBuilder().build()));
        return "/mdl-index.html";
    }
}
