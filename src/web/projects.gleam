import gleam/option.{type Option, None, Some}
import web/github

pub type Ptype {
  Owner
  Work
  Other
}

// TODO: Add start and end date
pub type Project {
  GenericProject(
    name: String,
    desc: String,
    repo_url: String,
    langs: List(String),
    contrib_desc: String,
    contrib_link: Option(String),
    project_type: Ptype,
  )
  GithubProject(
    name: String,
    org: String,
    contrib_desc: String,
    project_type: Ptype,
    show_changes: Bool,
    remote_info: Option(github.GitHubProjectRemoteInfo),
  )
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
      True,
      None,
    ),
    GithubProject(
      "repoxplorer",
      "morucci",
      "I started this project and was the main contribution on it",
      Owner,
      False,
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
      None,
      Work,
    ),
    GithubProject(
      "sf-operator",
      "softwarefactory-project",
      "I'm currently actively working on that project with the help of my co-workers.",
      Work,
      False,
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
      False,
      None,
    ),
    GithubProject(
      "MemoryMaster",
      "web-apps-lab",
      "A second game after HazardHunter and because it was fun to build.",
      Owner,
      False,
      None,
    ),
    GithubProject(
      "FreeSnaky",
      "morucci",
      "A challenge to learn more about Haskell, the Brick engine and capability to have the whole game logic handled server side and the terminal UI to be just a dumb display.",
      Owner,
      False,
      None,
    ),
    GithubProject(
      "schat",
      "morucci",
      "This is a learning project around Haskell and HTMX.",
      Owner,
      False,
      None,
    ),
    GithubProject(
      "bbot",
      "morucci",
      "A little project I've wrote mainly to learn about OCaml.",
      Owner,
      False,
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
      False,
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
      False,
      None,
    ),
    GithubProject(
      "haskell-butler",
      "ButlerOS",
      "I contributed a login system based on OpenID Connect.",
      Other,
      False,
      None,
    ),
  ]
}
