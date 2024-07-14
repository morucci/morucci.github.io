import lustre/attribute.{class, src}
import lustre/element/html.{div, img, p, text}
import web/utils.{mk_link, mk_page_title}

pub fn view_home(_model) {
  div([], [
    mk_page_title("Welcome on my web page"),
    div([class("flex flex-col gap-2")], [
      div([class("self-center")], [
        img([
          class("rounded-full w-32 h-32"),
          src("https://avatars.githubusercontent.com/u/84583"),
        ]),
      ]),
      div([class("flex flex-col gap-2")], [
        p([], [
          text(
            "My name is Fabien Boucher, I'm currenlty working for Red Hat as a Principal Software Engineer.",
          ),
          text(
            " At work, I maintain the production chain CI infrastructure for OSP (the Red Hat OpenStack Platform) and for",
          ),
          mk_link("https://www.rdoproject.org", " RDO"),
          text(". I contribute to"),
          mk_link("/projects", " various Open Source projects "),
          text("for work and during my free time."),
        ]),
      ]),
    ]),
  ])
}
