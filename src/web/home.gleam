import lustre/attribute.{class, src}
import lustre/element/html.{div, img, p, text}
import web/utils.{mk_link, mk_page_title}

pub fn view_home(_model) {
  div([], [
    mk_page_title("Welcome to My Website!"),
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
            "Hello I'm Fabien Boucher, I currently work as a Principal Software Engineer at Red Hat"
            <> " where I maintain the CI infrastructure for Red Hat OpenStack Platform (OSP) and for",
          ),
          mk_link("https://www.rdoproject.org", " RDO"),
          text(". I contribute to"),
          mk_link("/projects", " various Open Source projects "),
          text("both professionally and in my free time."),
        ]),
      ]),
    ]),
  ])
}
