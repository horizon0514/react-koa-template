FROM acs-reg.alipay.com/dockerlab/tnpm:centos6-v6.9.1-4.14.2

ENV PORT=80

USER root

COPY . /usr/app/src

WORKDIR /usr/app/src

RUN tnpm -v && tnpm install

ADD ./scripts/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["sh", "/entrypoint.sh"]

EXPOSE 80
