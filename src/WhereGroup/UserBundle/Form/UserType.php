<?php

namespace WhereGroup\UserBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class UserType
 * @package WhereGroup\UserBundle\Form
 */
class UserType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username')
            ->add('password', 'password', array('required' => false))
            ->add('email', null, array('required' => false))
            ->add(
                'groups',
                'entity',
                array(
                    'class'        =>  'WhereGroupUserBundle:Group',
                    'multiple'     => true,
                    'choice_label' => 'role',
                    'label'        => 'Gruppe',
                    'required'     => false
                )
            )
            ->add('isActive')
            ;
        ;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'WhereGroup\UserBundle\Entity\User'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'wheregroup_userbundle_usertype';
    }
}
