import gleam/int
import gleam/io
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import lustre/attribute.{class, href}
import lustre/effect.{type Effect}
import lustre/element.{none}
import lustre/element/html.{a, div, h2, text}
import lustre/element/svg.{path}
import web/github
import web/types.{
  type Model, type Msg, type Project, Changes, Commits, GenericProject,
  GithubProject, Other, Owner, Work,
}
import web/utils.{mk_link, mk_page_title}

pub fn change_svg() {
  let xmlns = attribute.attribute("xmlns", "http://www.w3.org/2000/svg")
  let width = attribute.attribute("width", "1em")
  let height = attribute.attribute("height", "1em")
  let viewbox = attribute.attribute("viewBox", "0 0 24 24")
  let fill = attribute.attribute("fill", "currentColor")
  let d1 =
    attribute.attribute(
      "d",
      "M16 19.25a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0m-14.5 0a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0m0-14.5a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0M4.75 3a1.75 1.75 0 1 0 .001 3.501A1.75 1.75 0 0 0 4.75 3m0 14.5a1.75 1.75 0 1 0 .001 3.501A1.75 1.75 0 0 0 4.75 17.5m14.5 0a1.75 1.75 0 1 0 .001 3.501a1.75 1.75 0 0 0-.001-3.501",
    )
  let d2 =
    attribute.attribute(
      "d",
      "M13.405 1.72a.75.75 0 0 1 0 1.06L12.185 4h4.065A3.75 3.75 0 0 1 20 7.75v8.75a.75.75 0 0 1-1.5 0V7.75a2.25 2.25 0 0 0-2.25-2.25h-4.064l1.22 1.22a.75.75 0 0 1-1.061 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 0M4.75 7.25A.75.75 0 0 1 5.5 8v8A.75.75 0 0 1 4 16V8a.75.75 0 0 1 .75-.75",
    )
  svg.svg([xmlns, width, height, viewbox], [path([fill, d1]), path([fill, d2])])
}

pub fn mk_changes_link(link) {
  a([class("text-indigo-500"), href(link)], [change_svg()])
}

pub fn list() -> List(Project) {
  [
    GithubProject(
      "monocle",
      "change-metrics",
      "I started this project and I'm on of the main contributors of this project. "
        <> "The project has been initially started in Python, then for the fun and "
        <> "with the help of a colleague we migrated the code to Haskell.",
      Owner,
      Some(Changes),
      None,
    ),
    GithubProject(
      "repoxplorer",
      "morucci",
      "I started this project and was the main contribution on it",
      Owner,
      Some(Commits),
      None,
    ),
    GenericProject(
      "Software Factory",
      " This project help us to maintain a development forge with Zuul as the main component for"
        <> " the CI/CD",
      "https://www.softwarefactory-project.io",
      ["Ansible", "Python"],
      "I'm working on this project with my co-workers. It is an infrastucture project and I used to"
        <> " provide improvements on the code base.",
      Some(
        "https://softwarefactory-project.io/r/q/(projects:%2522software-factory%2522+author:%2522Fabien+Boucher%2522+status:merged)+AND+NOT+project:software-factory/sf-operator",
      ),
      Work,
    ),
    GithubProject(
      "sf-operator",
      "softwarefactory-project",
      "I'm currently actively working on that project with the help of my co-workers.",
      Work,
      Some(Commits),
      None,
    ),
    GenericProject(
      "Zuul CI",
      "This an Opendev's project initialy developed for the OpenStack project CI.",
      "https://opendev.org/zuul/zuul",
      ["Python", "TypeScript"],
      "I've contributed several improvment to Zuul, mainly the Git, Pagure, ElasticSearch and GitLab driver",
      Some(
        "https://review.opendev.org/q/project:+zuul/zuul+author:%22Fabien+Boucher%22+status:merged",
      ),
      Work,
    ),
    GithubProject(
      "HazardHunter",
      "web-apps-lab",
      "Wanted to challenge myself to leverage HTMX via ButlerOS.",
      Owner,
      Some(Commits),
      None,
    ),
    GithubProject(
      "MemoryMaster",
      "web-apps-lab",
      "A second game after HazardHunter and because it was fun to build.",
      Owner,
      Some(Commits),
      None,
    ),
    GithubProject(
      "FreeSnaky",
      "morucci",
      "A challenge to learn more about Haskell, the Brick engine and capability to have the whole game logic handled server side and the terminal UI to be just a dumb display.",
      Owner,
      Some(Commits),
      None,
    ),
    GithubProject(
      "schat",
      "morucci",
      "This is a learning project around Haskell and HTMX.",
      Owner,
      Some(Commits),
      None,
    ),
    GithubProject(
      "bbot",
      "morucci",
      "A little project I've wrote mainly to learn about OCaml.",
      Owner,
      Some(Commits),
      None,
    ),
    GenericProject(
      "FM gateway",
      "Gateway to send fedora-messaging messages to the Zuul Pagure driver web-hook service.",
      "https://pagure.io/fm-gateway",
      ["Python"],
      "I've build that project to solve an integration issue between Zuul and the Fedora Pagure Forge",
      Some("https://pagure.io/fm-gateway/commits?author=fboucher@redhat.com"),
      Work,
    ),
    GithubProject(
      "pidstat-grapher",
      "morucci",
      "Project I wrote due to a need to plot system processes resources consumption",
      Owner,
      Some(Commits),
      None,
    ),
    GenericProject(
      "openstack/swift",
      "Openstack Object Storage",
      "https://opendev.org/openstack/swift",
      ["Python"],
      "I've mainly worked on the Quota middleware.",
      Some(
        "https://review.opendev.org/q/project:+openstack/swift+author:%22Fabien%20Boucher%22+status:merged",
      ),
      Work,
    ),
    GenericProject(
      "zuul-distro-jobs",
      "A library of Zuul jobs for RPM packages build/test integrations",
      "https://pagure.io/zuul-distro-jobs",
      ["Ansible"],
      "I've created that project in order to leverage Zuul CI for RPM based distribution CI purpose",
      Some(
        "https://pagure.io/zuul-distro-jobs/commits?author=fboucher@redhat.com",
      ),
      Work,
    ),
    GenericProject(
      "fedora-project-config",
      "The main Zuul job defintion of Fedora Zuul CI",
      "https://pagure.io/fedora-project-config",
      ["Ansible", "Dhall"],
      "I've initialized this project, based on Zuul and zuul-distro-jobs, to provide CI jobs for validating Fedora packaging.",
      Some(
        "https://pagure.io/fedora-project-config/commits?author=fboucher@redhat.com",
      ),
      Work,
    ),
    GithubProject(
      "dulwich",
      "jelmer",
      "I contributed a GIT store backend based on an OpenStack Swift object store.",
      Other,
      Some(Changes),
      None,
    ),
    GithubProject(
      "haskell-butler",
      "ButlerOS",
      "I contributed a login system based on OpenID Connect.",
      Other,
      Some(Changes),
      None,
    ),
  ]
}

pub fn get_project(project: Project) -> Effect(Msg) {
  case project {
    GenericProject(..) -> effect.none()
    GithubProject(name, org, _, _, _, Some(_)) -> {
      io.debug(
        "remote infos for alreay for "
        <> github.build_full_name(org, name)
        <> " already in app state",
      )
      effect.none()
    }
    GithubProject(name, org, _, _, _, None) -> github.get_project(name, org)
  }
}

fn view_project(project: Project) {
  case project {
    GenericProject(
      name,
      desc,
      repo_url,
      langs,
      contrib_desc,
      contrib_link,
      _ptype,
    ) -> {
      div([], [
        div([class("flex justify-between")], [
          mk_link(repo_url, name),
          div([class("flex flex-row gap-2")], [
            case contrib_link {
              Some(link) -> mk_changes_link(link)
              None -> none()
            },
            div([], [langs |> string.join("/") |> text]),
          ]),
        ]),
        div([class("grid gap-1")], [
          div([], [text(desc)]),
          div([], [text(contrib_desc)]),
        ]),
      ])
    }
    GithubProject(name, org, contrib_desc, _, show_changes, Some(ri)) -> {
      div([], [
        div([class("flex justify-between")], [
          div([class("flex gap-1")], [
            mk_link("https://github.com/" <> org <> "/" <> name, name),
          ]),
          div([class("flex flex-row gap-2")], [
            case show_changes {
              Some(Changes) ->
                div([], [mk_changes_link(github.mk_changes_url(name, org))])
              Some(Commits) ->
                div([], [mk_changes_link(github.mk_changes_url(name, org))])
              None -> none()
            },
            div([], [text(ri.stars |> int.to_string <> "⭐")]),
            div([], [text(ri.language)]),
          ]),
        ]),
        div([class("grid gap-1")], [
          div([], [text(ri.description |> option.unwrap("No description"))]),
          div([], [text(contrib_desc)]),
        ]),
      ])
    }
    _ -> none()
  }
}

pub fn view_projects(model: Model) {
  let section_title = fn(title: String) {
    h2([class("text-2xl font-bold text-blue-100")], [text(title)])
  }
  div([], [
    div([], [mk_page_title("Projects")]),
    div([class("grid gap-6")], [
      div([class("grid gap-1")], [
        section_title("Projects I have originaly created"),
        div(
          [class("grid gap-2")],
          model.projects
            |> list.filter(fn(p) {
              case p {
                GithubProject(project_type: Owner, ..) -> True
                GenericProject(project_type: Owner, ..) -> True
                _ -> False
              }
            })
            |> list.map(view_project),
        ),
      ]),
      div([class("grid gap-1")], [
        section_title("Projects I've contributed to for my employer"),
        div(
          [class("grid gap-2")],
          model.projects
            |> list.filter(fn(p) {
              case p {
                GithubProject(project_type: Work, ..) -> True
                GenericProject(project_type: Work, ..) -> True
                _ -> False
              }
            })
            |> list.map(view_project),
        ),
      ]),
      div([class("grid gap-1")], [
        section_title("Projects I've contributed on my free time"),
        div(
          [class("grid gap-2")],
          model.projects
            |> list.filter(fn(p) {
              case p {
                GithubProject(project_type: Other, ..) -> True
                GenericProject(project_type: Other, ..) -> True
                _ -> False
              }
            })
            |> list.map(view_project),
        ),
      ]),
    ]),
  ])
}
